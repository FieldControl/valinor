import {
  Injectable, ViewContainerRef, ComponentFactoryResolver, Type, Injector, Compiler, Inject, NgModuleFactory, ComponentRef, ComponentFactory, NgModuleRef
} from '@angular/core';
import { LAZY_WIDGETS } from 'app/lazy-widgets';
import { Subscription } from 'rxjs';

@Injectable()
export class DynamicComponentCreatorService {

  /**
   * É onde contém a fábrica de componentes é usado para criar e destruir os mesmos dinâmicamente
   * é necessário receber ele da pagina raiz do módulo a ser utilizado
   */
  protected viewContainerRef: ViewContainerRef;
  /** Array que contém as referências dos componentes */
  protected componentsReferences: Array<ComponentRef<any>> = [];

  constructor(
    private _compiler: Compiler,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _injector: Injector,
    @Inject(LAZY_WIDGETS) private _lazyWidgets: { [key: string]: () => Promise<NgModuleFactory<any> | Type<any>> },
  ) {
  }

  /**
   * Limpa a pilha do container
   */
  private clearStack() {
    this.viewContainerRef.clear();
    this.componentsReferences = [];
  }

  /**
   * Recupera a instância de um objeto na pilha.
   * @param index Número do objeto na pilha
   */
  private getComponentInstance<T>(index: number): T {
    return this.componentsReferences[index].instance;
  }

  /**
   * Recupera a lista de componentes
   */
  private getComponentList(): Array<any> {
    return this.componentsReferences;
  }

  // public async open<T>(name, component, options: smartModalOptions = {}, inputs: Object = {}, outputs: {}[] = []): Promise<T> {
  //   const modalFactory: any = await this.getModalFactory();
  //   const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
  //   this.viewContainerRef = this.modalRoot.getView();
  //   let componentRef = this.viewContainerRef.createComponent(componentFactory); let currentComponent = componentRef.instance as any;
  //   let modalRef = this.viewContainerRef.createComponent(modalFactory, 0, undefined, [[componentRef.location.nativeElement]]);
  //   Object.assign(modalRef.instance, { name }, options);
  //   Object.assign(currentComponent, inputs, { close: () => this.close(name) });
  //   var subscriptions = new Subscription();
  //   outputs.forEach(o => { let func = Object.keys(o)[0]; subscriptions.add(currentComponent[func].subscribe(params => { o[func](params); })) });
  //   this.modalsOpen.push({ name, component: componentRef, subscriptions });
  //   this.modalRef = modalRef; return currentComponent as T;
  // }

  /**
  * Cria um componente dinamico e retorna sua referência para executar métodos ou acessar propriedades do mesmo
  * @param component Componente que será criado
  * @param modulePath Caminho da rota definido para acessar o módulo, olhar const de rotas no modulo que exporta as rotas
  * @param params parametros que serão passados ex: {title: 'titulo'}
  * @param callbackFn função para ser executada antes de destruir o componente
  * @returns retorna a instancia do componente criado
  */
  async create<T = any>(components: Array<Type<any>>, modulePath: string, identifier: string, inputs: Array<Object> = [], outputs: Array<Object> = []): Promise<T> {

    const moduleFactory = await this._compileModule(modulePath);
    const moduleRef = moduleFactory.create(this._injector);
    /** Define a fabrica do componente */
    const componentFactory = moduleRef.componentFactoryResolver.resolveComponentFactory(components[0]);
    /** Cria o componente e retorna sua referência */
    const componentRef = this._createComponents(componentFactory, moduleRef, components, inputs);
    /** Instancia do componente criado */
    const currentComponent = componentRef.instance as T;

    Reflect.defineProperty(currentComponent as any, '__name', { writable: true });
    Reflect.set(currentComponent as any, '__name', identifier);
    this._setOutputs(outputs, currentComponent, componentRef);
    this.componentsReferences.push(componentRef);
    return currentComponent;
  }

  /**
   * Recebe o viewContainerRef da pagina root do modulo para criar componentes dinâmicamente
   * @param viewContainerRef viewContainerRef do componente
   */
  defineRootContainerRef(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }

  /**
   * Da um pop na lista de componentes criados se não for passado o indice ele vai dar pop no ultimo componente
   * @param index indice do componente
   */
  destroy(name?: string) {
    if (this.viewContainerRef.length < 1) { return; }
    let componentRef: ComponentRef<any>;
    // Se for passado um indice então
    if (name) {
      // Filtra o componente baseado no indice dele no array que contém as referencias dos mesmos
      componentRef = this.componentsReferences.filter((element) => element.instance.__name === name)[0];
      // Salvando o indice do componente para remover na função do VCR
      componentRef.destroy();
      // Remove o componente da pilha de referencias
      this.componentsReferences = this.componentsReferences.filter((element) => element.instance.__name !== name);
    } else {
      componentRef = this.componentsReferences[this.componentsReferences.length - 1];

      this.viewContainerRef.remove();
      this.componentsReferences.pop();
    }
    componentRef.instance.subscriptions.unsubscribe();
  }

  private async _compileModule(modulePath: string): Promise<NgModuleFactory<any>> {
    try {
      const tempModule = await this._lazyWidgets[modulePath]();
      let moduleFactory: NgModuleFactory<any>;
      if (tempModule instanceof NgModuleFactory) {
        // For AOT
        moduleFactory = tempModule;
      } else {
        // For JIT
        moduleFactory = await this._compiler.compileModuleAsync(tempModule);
      }
      return moduleFactory;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  private _createComponents<T>(componentFactory: ComponentFactory<any>, ngModule: NgModuleRef<any>, components: Array<Type<T>>, inputs: Array<Object>): ComponentRef<T> {
    if (components.length === 1) {
      const componentRef = this.viewContainerRef.createComponent(componentFactory);
      Object.assign(componentRef.instance, inputs[0]);
      return componentRef;
    }
    const componentsArray: Array<any> = [];
    for (let index = 1; index < components.length; index++) {
      let componentRef = this.viewContainerRef.createComponent(
        ngModule.componentFactoryResolver.resolveComponentFactory(components[index])
      )
      Object.assign(componentRef.instance, inputs[index]);
      componentsArray.push(
        componentRef.location.nativeElement
      )
    }
    const componentRef = this.viewContainerRef.createComponent(componentFactory, 0, this._injector, [componentsArray]);
    Object.assign(componentRef.instance, inputs[0]);
    return componentRef;
  }

  private _setOutputs<T = any>(outputs: Array<Object>, currentComponent, componentRef: ComponentRef<T>) {
    let subscriptions = new Subscription();
    if (outputs.length) {
      outputs.forEach(output => {
        let fn = Object.keys(output)[0];
        subscriptions.add(currentComponent[fn].subscribe(params => {
          output[fn](params);
        }))
      });
    }
    Reflect.defineProperty(currentComponent, 'subscriptions', { writable: true });
    currentComponent.subscriptions = subscriptions;
  }

  /**
   * Retorna o tamanho do indice do componente
   */
  private getComponentLength(): number {
    return this.componentsReferences.length;
  }

}
