import Swal from 'sweetalert2';

export class EmitirAlerta {
  msg: any;


  public static AlertaToastSuccess(msg: string, position?: any): any {
    const Toast = Swal.mixin({
      toast: true,
      position: position || 'top',
      customClass: {
        container: 'alertaToastNotificacaoTop',
        popup: 'popup-swall-custom-success',
        icon: 'icon-swall-custom-success',
        title: 'title-swall-white-success',
      },
      
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast: any) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      },
    })

    Toast.fire({
      icon: 'success',
      title: msg,
    })
  }

  public static AlertaToastError(msg?: string, position?: any): any {
    const Toast = Swal.mixin({
      toast: true,
      position: position || 'top',
      customClass: {
        container: 'alertaToastNotificacaoTop',
        popup: 'popup-swall-custom-error',
        icon: 'icon-swall-custom-error',
        title: 'title-swall-white-error',
      },
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      didOpen: (toast: any) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    Toast.fire({
      icon: 'error',
      title: msg || 'Ops. Algo deu errado, tente novamente.',
    })
  }


  public static AlertaCarregando() {
    return Swal.fire({
      color: '#fff',
      html: '<i class="fas fa-clock" aria-hidden="true"></i> <br> <b>Aguarde...</b>',
      showCloseButton: false,
      showCancelButton: false,
      allowOutsideClick: false,
      showConfirmButton: false,
      width: 200,
      background: '#ffffff00',
    });
  }

  public static FecharAlertaCarregando() {
    Swal.close();
  }

}
