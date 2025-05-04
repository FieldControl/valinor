"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchematicEngine = exports.TaskScheduler = exports.CollectionImpl = exports.UnknownTaskDependencyException = exports.UnregisteredTaskException = exports.SchematicEngineConflictingException = exports.PrivateSchematicException = exports.UnknownSchematicException = exports.CircularCollectionException = exports.UnknownCollectionException = exports.UnknownUrlSourceProtocol = void 0;
const core_1 = require("@angular-devkit/core");
const rxjs_1 = require("rxjs");
const interface_1 = require("../tree/interface");
const null_1 = require("../tree/null");
const static_1 = require("../tree/static");
const schematic_1 = require("./schematic");
class UnknownUrlSourceProtocol extends core_1.BaseException {
    constructor(url) {
        super(`Unknown Protocol on url "${url}".`);
    }
}
exports.UnknownUrlSourceProtocol = UnknownUrlSourceProtocol;
class UnknownCollectionException extends core_1.BaseException {
    constructor(name) {
        super(`Unknown collection "${name}".`);
    }
}
exports.UnknownCollectionException = UnknownCollectionException;
class CircularCollectionException extends core_1.BaseException {
    constructor(name) {
        super(`Circular collection reference "${name}".`);
    }
}
exports.CircularCollectionException = CircularCollectionException;
class UnknownSchematicException extends core_1.BaseException {
    constructor(name, collection) {
        super(`Schematic "${name}" not found in collection "${collection.name}".`);
    }
}
exports.UnknownSchematicException = UnknownSchematicException;
class PrivateSchematicException extends core_1.BaseException {
    constructor(name, collection) {
        super(`Schematic "${name}" not found in collection "${collection.name}".`);
    }
}
exports.PrivateSchematicException = PrivateSchematicException;
class SchematicEngineConflictingException extends core_1.BaseException {
    constructor() {
        super(`A schematic was called from a different engine as its parent.`);
    }
}
exports.SchematicEngineConflictingException = SchematicEngineConflictingException;
class UnregisteredTaskException extends core_1.BaseException {
    constructor(name, schematic) {
        const addendum = schematic ? ` in schematic "${schematic.name}"` : '';
        super(`Unregistered task "${name}"${addendum}.`);
    }
}
exports.UnregisteredTaskException = UnregisteredTaskException;
class UnknownTaskDependencyException extends core_1.BaseException {
    constructor(id) {
        super(`Unknown task dependency [ID: ${id.id}].`);
    }
}
exports.UnknownTaskDependencyException = UnknownTaskDependencyException;
class CollectionImpl {
    constructor(_description, _engine, baseDescriptions) {
        this._description = _description;
        this._engine = _engine;
        this.baseDescriptions = baseDescriptions;
    }
    get description() {
        return this._description;
    }
    get name() {
        return this.description.name || '<unknown>';
    }
    createSchematic(name, allowPrivate = false) {
        return this._engine.createSchematic(name, this, allowPrivate);
    }
    listSchematicNames(includeHidden) {
        return this._engine.listSchematicNames(this, includeHidden);
    }
}
exports.CollectionImpl = CollectionImpl;
class TaskScheduler {
    constructor(_context) {
        this._context = _context;
        this._queue = new core_1.PriorityQueue((x, y) => x.priority - y.priority);
        this._taskIds = new Map();
    }
    _calculatePriority(dependencies) {
        if (dependencies.size === 0) {
            return 0;
        }
        const prio = [...dependencies].reduce((prio, task) => prio + task.priority, 1);
        return prio;
    }
    _mapDependencies(dependencies) {
        if (!dependencies) {
            return new Set();
        }
        const tasks = dependencies.map((dep) => {
            const task = this._taskIds.get(dep);
            if (!task) {
                throw new UnknownTaskDependencyException(dep);
            }
            return task;
        });
        return new Set(tasks);
    }
    schedule(taskConfiguration) {
        const dependencies = this._mapDependencies(taskConfiguration.dependencies);
        const priority = this._calculatePriority(dependencies);
        const task = {
            id: TaskScheduler._taskIdCounter++,
            priority,
            configuration: taskConfiguration,
            context: this._context,
        };
        this._queue.push(task);
        const id = { id: task.id };
        this._taskIds.set(id, task);
        return id;
    }
    finalize() {
        const tasks = this._queue.toArray();
        this._queue.clear();
        this._taskIds.clear();
        return tasks;
    }
}
TaskScheduler._taskIdCounter = 1;
exports.TaskScheduler = TaskScheduler;
class SchematicEngine {
    constructor(_host, _workflow) {
        this._host = _host;
        this._workflow = _workflow;
        this._collectionCache = new Map();
        this._schematicCache = new WeakMap();
        this._taskSchedulers = new Array();
    }
    get workflow() {
        return this._workflow || null;
    }
    get defaultMergeStrategy() {
        return this._host.defaultMergeStrategy || interface_1.MergeStrategy.Default;
    }
    createCollection(name, requester) {
        let collection = this._collectionCache.get(name);
        if (collection) {
            return collection;
        }
        const [description, bases] = this._createCollectionDescription(name, requester?.description);
        collection = new CollectionImpl(description, this, bases);
        this._collectionCache.set(name, collection);
        this._schematicCache.set(collection, new Map());
        return collection;
    }
    _createCollectionDescription(name, requester, parentNames) {
        const description = this._host.createCollectionDescription(name, requester);
        if (!description) {
            throw new UnknownCollectionException(name);
        }
        if (parentNames && parentNames.has(description.name)) {
            throw new CircularCollectionException(name);
        }
        const bases = new Array();
        if (description.extends) {
            parentNames = (parentNames || new Set()).add(description.name);
            for (const baseName of description.extends) {
                const [base, baseBases] = this._createCollectionDescription(baseName, description, new Set(parentNames));
                bases.unshift(base, ...baseBases);
            }
        }
        return [description, bases];
    }
    createContext(schematic, parent, executionOptions) {
        // Check for inconsistencies.
        if (parent && parent.engine && parent.engine !== this) {
            throw new SchematicEngineConflictingException();
        }
        let interactive = true;
        if (executionOptions && executionOptions.interactive != undefined) {
            interactive = executionOptions.interactive;
        }
        else if (parent && parent.interactive != undefined) {
            interactive = parent.interactive;
        }
        let context = {
            debug: (parent && parent.debug) || false,
            engine: this,
            logger: (parent && parent.logger && parent.logger.createChild(schematic.description.name)) ||
                new core_1.logging.NullLogger(),
            schematic,
            strategy: parent && parent.strategy !== undefined ? parent.strategy : this.defaultMergeStrategy,
            interactive,
            addTask,
        };
        const maybeNewContext = this._host.transformContext(context);
        if (maybeNewContext) {
            context = maybeNewContext;
        }
        const taskScheduler = new TaskScheduler(context);
        const host = this._host;
        this._taskSchedulers.push(taskScheduler);
        function addTask(task, dependencies) {
            const config = task.toConfiguration();
            if (!host.hasTaskExecutor(config.name)) {
                throw new UnregisteredTaskException(config.name, schematic.description);
            }
            config.dependencies = config.dependencies || [];
            if (dependencies) {
                config.dependencies.unshift(...dependencies);
            }
            return taskScheduler.schedule(config);
        }
        return context;
    }
    createSchematic(name, collection, allowPrivate = false) {
        const schematicMap = this._schematicCache.get(collection);
        let schematic = schematicMap?.get(name);
        if (schematic) {
            return schematic;
        }
        let collectionDescription = collection.description;
        let description = this._host.createSchematicDescription(name, collection.description);
        if (!description) {
            if (collection.baseDescriptions) {
                for (const base of collection.baseDescriptions) {
                    description = this._host.createSchematicDescription(name, base);
                    if (description) {
                        collectionDescription = base;
                        break;
                    }
                }
            }
            if (!description) {
                // Report the error for the top level schematic collection
                throw new UnknownSchematicException(name, collection.description);
            }
        }
        if (description.private && !allowPrivate) {
            throw new PrivateSchematicException(name, collection.description);
        }
        const factory = this._host.getSchematicRuleFactory(description, collectionDescription);
        schematic = new schematic_1.SchematicImpl(description, factory, collection, this);
        schematicMap?.set(name, schematic);
        return schematic;
    }
    listSchematicNames(collection, includeHidden) {
        const names = this._host.listSchematicNames(collection.description, includeHidden);
        if (collection.baseDescriptions) {
            for (const base of collection.baseDescriptions) {
                names.push(...this._host.listSchematicNames(base, includeHidden));
            }
        }
        // remove duplicates
        return [...new Set(names)].sort();
    }
    transformOptions(schematic, options, context) {
        return this._host.transformOptions(schematic.description, options, context);
    }
    createSourceFromUrl(url, context) {
        switch (url.protocol) {
            case 'null:':
                return () => new null_1.NullTree();
            case 'empty:':
                return () => (0, static_1.empty)();
            default:
                const hostSource = this._host.createSourceFromUrl(url, context);
                if (!hostSource) {
                    throw new UnknownUrlSourceProtocol(url.toString());
                }
                return hostSource;
        }
    }
    executePostTasks() {
        const executors = new Map();
        const taskObservable = (0, rxjs_1.from)(this._taskSchedulers).pipe((0, rxjs_1.concatMap)((scheduler) => scheduler.finalize()), (0, rxjs_1.concatMap)((task) => {
            const { name, options } = task.configuration;
            const executor = executors.get(name);
            if (executor) {
                return executor(options, task.context);
            }
            return this._host.createTaskExecutor(name).pipe((0, rxjs_1.concatMap)((executor) => {
                executors.set(name, executor);
                return executor(options, task.context);
            }));
        }));
        return taskObservable;
    }
}
exports.SchematicEngine = SchematicEngine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5naW5lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvYW5ndWxhcl9kZXZraXQvc2NoZW1hdGljcy9zcmMvZW5naW5lL2VuZ2luZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQ0FBNkU7QUFDN0UsK0JBQXFFO0FBRXJFLGlEQUFrRDtBQUNsRCx1Q0FBd0M7QUFDeEMsMkNBQXVDO0FBbUJ2QywyQ0FBNEM7QUFFNUMsTUFBYSx3QkFBeUIsU0FBUSxvQkFBYTtJQUN6RCxZQUFZLEdBQVc7UUFDckIsS0FBSyxDQUFDLDRCQUE0QixHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzdDLENBQUM7Q0FDRjtBQUpELDREQUlDO0FBRUQsTUFBYSwwQkFBMkIsU0FBUSxvQkFBYTtJQUMzRCxZQUFZLElBQVk7UUFDdEIsS0FBSyxDQUFDLHVCQUF1QixJQUFJLElBQUksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7Q0FDRjtBQUpELGdFQUlDO0FBRUQsTUFBYSwyQkFBNEIsU0FBUSxvQkFBYTtJQUM1RCxZQUFZLElBQVk7UUFDdEIsS0FBSyxDQUFDLGtDQUFrQyxJQUFJLElBQUksQ0FBQyxDQUFDO0lBQ3BELENBQUM7Q0FDRjtBQUpELGtFQUlDO0FBRUQsTUFBYSx5QkFBMEIsU0FBUSxvQkFBYTtJQUMxRCxZQUFZLElBQVksRUFBRSxVQUFxQztRQUM3RCxLQUFLLENBQUMsY0FBYyxJQUFJLDhCQUE4QixVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUM3RSxDQUFDO0NBQ0Y7QUFKRCw4REFJQztBQUVELE1BQWEseUJBQTBCLFNBQVEsb0JBQWE7SUFDMUQsWUFBWSxJQUFZLEVBQUUsVUFBcUM7UUFDN0QsS0FBSyxDQUFDLGNBQWMsSUFBSSw4QkFBOEIsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7SUFDN0UsQ0FBQztDQUNGO0FBSkQsOERBSUM7QUFFRCxN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QUksQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN4QztZQUVELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQzdDLElBQUEsZ0JBQVMsRUFBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUNyQixTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFFOUIsT0FBTyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FDSCxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQ0gsQ0FBQztRQUVGLE9BQU8sY0FBYyxDQUFDO0lBQ3hCLENBQUM7Q0FDRjtBQTFPRCwwQ0EwT0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHsgQmFzZUV4Y2VwdGlvbiwgUHJpb3JpdHlRdWV1ZSwgbG9nZ2luZyB9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIGNvbmNhdE1hcCwgZnJvbSBhcyBvYnNlcnZhYmxlRnJvbSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgVXJsIH0gZnJvbSAndXJsJztcbmltcG9ydCB7IE1lcmdlU3RyYXRlZ3kgfSBmcm9tICcuLi90cmVlL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBOdWxsVHJlZSB9IGZyb20gJy4uL3RyZWUvbnVsbCc7XG5pbXBvcnQgeyBlbXB0eSB9IGZyb20gJy4uL3RyZWUvc3RhdGljJztcbmltcG9ydCB7IFdvcmtmbG93IH0gZnJvbSAnLi4vd29ya2Zsb3cvaW50ZXJmYWNlJztcbmltcG9ydCB7XG4gIENvbGxlY3Rpb24sXG4gIENvbGxlY3Rpb25EZXNjcmlwdGlvbixcbiAgRW5naW5lLFxuICBFbmdpbmVIb3N0LFxuICBFeGVjdXRpb25PcHRpb25zLFxuICBTY2hlbWF0aWMsXG4gIFNjaGVtYXRpY0NvbnRleHQsXG4gIFNjaGVtYXRpY0Rlc2NyaXB0aW9uLFxuICBTb3VyY2UsXG4gIFRhc2tDb25maWd1cmF0aW9uLFxuICBUYXNrQ29uZmlndXJhdGlvbkdlbmVyYXRvcixcbiAgVGFza0V4ZWN1dG9yLFxuICBUYXNrSWQsXG4gIFRhc2tJbmZvLFxuICBUeXBlZFNjaGVtYXRpY0NvbnRleHQsXG59IGZyb20gJy4vaW50ZXJmYWNlJztcbmltcG9ydCB7IFNjaGVtYXRpY0ltcGwgfSBmcm9tICcuL3NjaGVtYXRpYyc7XG5cbmV4cG9ydCBjbGFzcyBVbmtub3duVXJsU291cmNlUHJvdG9jb2wgZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IodXJsOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgVW5rbm93biBQcm90b2NvbCBvbiB1cmwgXCIke3VybH1cIi5gKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVW5rbm93bkNvbGxlY3Rpb25FeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoYFVua25vd24gY29sbGVjdGlvbiBcIiR7bmFtZX1cIi5gKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ2lyY3VsYXJDb2xsZWN0aW9uRXhjZXB0aW9uIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgIHN1cGVyKGBDaXJjdWxhciBjb2xsZWN0aW9uIHJlZmVyZW5jZSBcIiR7bmFtZX1cIi5gKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVW5rbm93blNjaGVtYXRpY0V4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGNvbGxlY3Rpb246IENvbGxlY3Rpb25EZXNjcmlwdGlvbjx7fT4pIHtcbiAgICBzdXBlcihgU2NoZW1hdGljIFwiJHtuYW1lfVwiIG5vdCBmb3VuZCBpbiBjb2xsZWN0aW9uIFwiJHtjb2xsZWN0aW9uLm5hbWV9XCIuYCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByaXZhdGVTY2hlbWF0aWNFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBjb2xsZWN0aW9uOiBDb2xsZWN0aW9uRGVzY3JpcHRpb248e30+KSB7XG4gICAgc3VwZXIoYFNjaGVtYXRpYyBcIiR7bmFtZX1cIiBub3QgZm91bmQgaW4gY29sbGVjdGlvbiBcIiR7Y29sbGVjdGlvbi5uYW1lfVwiLmApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTY2hlbWF0aWNFbmdpbmVDb25mbGljdGluZ0V4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihgQSBzY2hlbWF0aWMgd2FzIGNhbGxlZCBmcm9tIGEgZGlmZmVyZW50IGVuZ2luZSBhcyBpdHMgcGFyZW50LmApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVbnJlZ2lzdGVyZWRUYXNrRXhjZXB0aW9uIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgc2NoZW1hdGljPzogU2NoZW1hdGljRGVzY3JpcHRpb248e30sIHt9Pikge1xuICAgIGNvbnN0IGFkZGVuZHVtID0gc2NoZW1hdGljID8gYCBpbiBzY2hlbWF0aWMgXCIke3NjaGVtYXRpYy5uYW1lfVwiYCA6ICcnO1xuICAgIHN1cGVyKGBVbnJlZ2lzdGVyZWQgdGFzayBcIiR7bmFtZX1cIiR7YWRkZW5kdW19LmApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBVbmtub3duVGFza0RlcGVuZGVuY3lFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IoaWQ6IFRhc2tJZCkge1xuICAgIHN1cGVyKGBVbmtub3duIHRhc2sgZGVwZW5kZW5jeSBbSUQ6ICR7aWQuaWR9XS5gKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQ29sbGVjdGlvbkltcGw8Q29sbGVjdGlvblQgZXh0ZW5kcyBvYmplY3QsIFNjaGVtYXRpY1QgZXh0ZW5kcyBvYmplY3Q+XG4gIGltcGxlbWVudHMgQ29sbGVjdGlvbjxDb2xsZWN0aW9uVCwgU2NoZW1hdGljVD5cbntcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZGVzY3JpcHRpb246IENvbGxlY3Rpb25EZXNjcmlwdGlvbjxDb2xsZWN0aW9uVD4sXG4gICAgcHJpdmF0ZSBfZW5naW5lOiBTY2hlbWF0aWNFbmdpbmU8Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+LFxuICAgIHB1YmxpYyByZWFkb25seSBiYXNlRGVzY3JpcHRpb25zPzogQXJyYXk8Q29sbGVjdGlvbkRlc2NyaXB0aW9uPENvbGxlY3Rpb25UPj4sXG4gICkge31cblxuICBnZXQgZGVzY3JpcHRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Rlc2NyaXB0aW9uO1xuICB9XG4gIGdldCBuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmRlc2NyaXB0aW9uLm5hbWUgfHwgJzx1bmtub3duPic7XG4gIH1cblxuICBjcmVhdGVTY2hlbWF0aWMobmFtZTogc3RyaW5nLCBhbGxvd1ByaXZhdGUgPSBmYWxzZSk6IFNjaGVtYXRpYzxDb2xsZWN0aW9uVCwgU2NoZW1hdGljVD4ge1xuICAgIHJldHVybiB0aGlzLl9lbmdpbmUuY3JlYXRlU2NoZW1hdGljKG5hbWUsIHRoaXMsIGFsbG93UHJpdmF0ZSk7XG4gIH1cblxuICBsaXN0U2NoZW1hdGljTmFtZXMoaW5jbHVkZUhpZGRlbj86IGJvb2xlYW4pOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZ2luZS5saXN0U2NoZW1hdGljTmFtZXModGhpcywgaW5jbHVkZUhpZGRlbik7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRhc2tTY2hlZHVsZXIge1xuICBwcml2YXRlIF9xdWV1ZSA9IG5ldyBQcmlvcml0eVF1ZXVlPFRhc2tJbmZvPigoeCwgeSkgPT4geC5wcmlvcml0eSAtIHkucHJpb3JpdHkpO1xuICBwcml2YXRlIF90YXNrSWRzID0gbmV3IE1hcDxUYXNrSWQsIFRhc2tJbmZvPigpO1xuICBwcml2YXRlIHN0YXRpYyBfdGFza0lkQ291bnRlciA9IDE7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkge31cblxuICBwcml2YXRlIF9jYWxjdWxhdGVQcmlvcml0eShkZXBlbmRlbmNpZXM6IFNldDxUYXNrSW5mbz4pOiBudW1iZXIge1xuICAgIGlmIChkZXBlbmRlbmNpZXMuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgY29uc3QgcHJpbyA9IFsuLi5kZXBlbmRlbmNpZXNdLnJlZHVjZSgocHJpbywgdGFzaykgPT4gcHJpbyArIHRhc2sucHJpb3JpdHksIDEpO1xuXG4gICAgcmV0dXJuIHByaW87XG4gIH1cblxuICBwcml2YXRlIF9tYXBEZXBlbmRlbmNpZXMoZGVwZW5kZW5jaWVzPzogQXJyYXk8VGFza0lkPik6IFNldDxUYXNrSW5mbz4ge1xuICAgIGlmICghZGVwZW5kZW5jaWVzKSB7XG4gICAgICByZXR1cm4gbmV3IFNldCgpO1xuICAgIH1cblxuICAgIGNvbnN0IHRhc2tzID0gZGVwZW5kZW5jaWVzLm1hcCgoZGVwKSA9PiB7XG4gICAgICBjb25zdCB0YXNrID0gdGhpcy5fdGFza0lkcy5nZXQoZGVwKTtcbiAgICAgIGlmICghdGFzaykge1xuICAgICAgICB0aHJvdyBuZXcgVW5rbm93blRhc2tEZXBlbmRlbmN5RXhjZXB0aW9uKGRlcCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0YXNrO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBTZXQodGFza3MpO1xuICB9XG5cbiAgc2NoZWR1bGU8VCBleHRlbmRzIG9iamVjdD4odGFza0NvbmZpZ3VyYXRpb246IFRhc2tDb25maWd1cmF0aW9uPFQ+KTogVGFza0lkIHtcbiAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSB0aGlzLl9tYXBEZXBlbmRlbmNpZXModGFza0NvbmZpZ3VyYXRpb24uZGVwZW5kZW5jaWVzKTtcbiAgICBjb25zdCBwcmlvcml0eSA9IHRoaXMuX2NhbGN1bGF0ZVByaW9yaXR5KGRlcGVuZGVuY2llcyk7XG5cbiAgICBjb25zdCB0YXNrID0ge1xuICAgICAgaWQ6IFRhc2tTY2hlZHVsZXIuX3Rhc2tJZENvdW50ZXIrKyxcbiAgICAgIHByaW9yaXR5LFxuICAgICAgY29uZmlndXJhdGlvbjogdGFza0NvbmZpZ3VyYXRpb24sXG4gICAgICBjb250ZXh0OiB0aGlzLl9jb250ZXh0LFxuICAgIH07XG5cbiAgICB0aGlzLl9xdWV1ZS5wdXNoKHRhc2spO1xuXG4gICAgY29uc3QgaWQgPSB7IGlkOiB0YXNrLmlkIH07XG4gICAgdGhpcy5fdGFza0lkcy5zZXQoaWQsIHRhc2spO1xuXG4gICAgcmV0dXJuIGlkO1xuICB9XG5cbiAgZmluYWxpemUoKTogUmVhZG9ubHlBcnJheTxUYXNrSW5mbz4ge1xuICAgIGNvbnN0IHRhc2tzID0gdGhpcy5fcXVldWUudG9BcnJheSgpO1xuICAgIHRoaXMuX3F1ZXVlLmNsZWFyKCk7XG4gICAgdGhpcy5fdGFza0lkcy5jbGVhcigpO1xuXG4gICAgcmV0dXJuIHRhc2tzO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTY2hlbWF0aWNFbmdpbmU8Q29sbGVjdGlvblQgZXh0ZW5kcyBvYmplY3QsIFNjaGVtYXRpY1QgZXh0ZW5kcyBvYmplY3Q+XG4gIGltcGxlbWVudHMgRW5naW5lPENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPlxue1xuICBwcml2YXRlIF9jb2xsZWN0aW9uQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgQ29sbGVjdGlvbkltcGw8Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+PigpO1xuICBwcml2YXRlIF9zY2hlbWF0aWNDYWNoZSA9IG5ldyBXZWFrTWFwPFxuICAgIENvbGxlY3Rpb248Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+LFxuICAgIE1hcDxzdHJpbmcsIFNjaGVtYXRpY0ltcGw8Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+PlxuICA+KCk7XG4gIHByaXZhdGUgX3Rhc2tTY2hlZHVsZXJzID0gbmV3IEFycmF5PFRhc2tTY2hlZHVsZXI+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaG9zdDogRW5naW5lSG9zdDxDb2xsZWN0aW9uVCwgU2NoZW1hdGljVD4sIHByb3RlY3RlZCBfd29ya2Zsb3c/OiBXb3JrZmxvdykge31cblxuICBnZXQgd29ya2Zsb3coKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dvcmtmbG93IHx8IG51bGw7XG4gIH1cbiAgZ2V0IGRlZmF1bHRNZXJnZVN0cmF0ZWd5KCkge1xuICAgIHJldHVybiB0aGlzLl9ob3N0LmRlZmF1bHRNZXJnZVN0cmF0ZWd5IHx8IE1lcmdlU3RyYXRlZ3kuRGVmYXVsdDtcbiAgfVxuXG4gIGNyZWF0ZUNvbGxlY3Rpb24oXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHJlcXVlc3Rlcj86IENvbGxlY3Rpb248Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+LFxuICApOiBDb2xsZWN0aW9uPENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPiB7XG4gICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLl9jb2xsZWN0aW9uQ2FjaGUuZ2V0KG5hbWUpO1xuICAgIGlmIChjb2xsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB9XG5cbiAgICBjb25zdCBbZGVzY3JpcHRpb24sIGJhc2VzXSA9IHRoaXMuX2NyZWF0ZUNvbGxlY3Rpb25EZXNjcmlwdGlvbihuYW1lLCByZXF1ZXN0ZXI/LmRlc2NyaXB0aW9uKTtcblxuICAgIGNvbGxlY3Rpb24gPSBuZXcgQ29sbGVjdGlvbkltcGw8Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+KGRlc2NyaXB0aW9uLCB0aGlzLCBiYXNlcyk7XG4gICAgdGhpcy5fY29sbGVjdGlvbkNhY2hlLnNldChuYW1lLCBjb2xsZWN0aW9uKTtcbiAgICB0aGlzLl9zY2hlbWF0aWNDYWNoZS5zZXQoY29sbGVjdGlvbiwgbmV3IE1hcCgpKTtcblxuICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlQ29sbGVjdGlvbkRlc2NyaXB0aW9uKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICByZXF1ZXN0ZXI/OiBDb2xsZWN0aW9uRGVzY3JpcHRpb248Q29sbGVjdGlvblQ+LFxuICAgIHBhcmVudE5hbWVzPzogU2V0PHN0cmluZz4sXG4gICk6IFtDb2xsZWN0aW9uRGVzY3JpcHRpb248Q29sbGVjdGlvblQ+LCBBcnJheTxDb2xsZWN0aW9uRGVzY3JpcHRpb248Q29sbGVjdGlvblQ+Pl0ge1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gdGhpcy5faG9zdC5jcmVhdGVDb2xsZWN0aW9uRGVzY3JpcHRpb24obmFtZSwgcmVxdWVzdGVyKTtcbiAgICBpZiAoIWRlc2NyaXB0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgVW5rbm93bkNvbGxlY3Rpb25FeGNlcHRpb24obmFtZSk7XG4gICAgfVxuICAgIGlmIChwYXJlbnROYW1lcyAmJiBwYXJlbnROYW1lcy5oYXMoZGVzY3JpcHRpb24ubmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBDaXJjdWxhckNvbGxlY3Rpb25FeGNlcHRpb24obmFtZSk7XG4gICAgfVxuXG4gICAgY29uc3QgYmFzZXMgPSBuZXcgQXJyYXk8Q29sbGVjdGlvbkRlc2NyaXB0aW9uPENvbGxlY3Rpb25UPj4oKTtcbiAgICBpZiAoZGVzY3JpcHRpb24uZXh0ZW5kcykge1xuICAgICAgcGFyZW50TmFtZXMgPSAocGFyZW50TmFtZXMgfHwgbmV3IFNldDxzdHJpbmc+KCkpLmFkZChkZXNjcmlwdGlvbi5uYW1lKTtcbiAgICAgIGZvciAoY29uc3QgYmFzZU5hbWUgb2YgZGVzY3JpcHRpb24uZXh0ZW5kcykge1xuICAgICAgICBjb25zdCBbYmFzZSwgYmFzZUJhc2VzXSA9IHRoaXMuX2NyZWF0ZUNvbGxlY3Rpb25EZXNjcmlwdGlvbihcbiAgICAgICAgICBiYXNlTmFtZSxcbiAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICBuZXcgU2V0KHBhcmVudE5hbWVzKSxcbiAgICAgICAgKTtcblxuICAgICAgICBiYXNlcy51bnNoaWZ0KGJhc2UsIC4uLmJhc2VCYXNlcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFtkZXNjcmlwdGlvbiwgYmFzZXNdO1xuICB9XG5cbiAgY3JlYXRlQ29udGV4dChcbiAgICBzY2hlbWF0aWM6IFNjaGVtYXRpYzxDb2xsZWN0aW9uVCwgU2NoZW1hdGljVD4sXG4gICAgcGFyZW50PzogUGFydGlhbDxUeXBlZFNjaGVtYXRpY0NvbnRleHQ8Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+PixcbiAgICBleGVjdXRpb25PcHRpb25zPzogUGFydGlhbDxFeGVjdXRpb25PcHRpb25zPixcbiAgKTogVHlwZWRTY2hlbWF0aWNDb250ZXh0PENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPiB7XG4gICAgLy8gQ2hlY2sgZm9yIGluY29uc2lzdGVuY2llcy5cbiAgICBpZiAocGFyZW50ICYmIHBhcmVudC5lbmdpbmUgJiYgcGFyZW50LmVuZ2luZSAhPT0gdGhpcykge1xuICAgICAgdGhyb3cgbmV3IFNjaGVtYXRpY0VuZ2luZUNvbmZsaWN0aW5nRXhjZXB0aW9uKCk7XG4gICAgfVxuXG4gICAgbGV0IGludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICBpZiAoZXhlY3V0aW9uT3B0aW9ucyAmJiBleGVjdXRpb25PcHRpb25zLmludGVyYWN0aXZlICE9IHVuZGVmaW5lZCkge1xuICAgICAgaW50ZXJhY3RpdmUgPSBleGVjdXRpb25PcHRpb25zLmludGVyYWN0aXZlO1xuICAgIH0gZWxzZSBpZiAocGFyZW50ICYmIHBhcmVudC5pbnRlcmFjdGl2ZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgIGludGVyYWN0aXZlID0gcGFyZW50LmludGVyYWN0aXZlO1xuICAgIH1cblxuICAgIGxldCBjb250ZXh0OiBUeXBlZFNjaGVtYXRpY0NvbnRleHQ8Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+ID0ge1xuICAgICAgZGVidWc6IChwYXJlbnQgJiYgcGFyZW50LmRlYnVnKSB8fCBmYWxzZSxcbiAgICAgIGVuZ2luZTogdGhpcyxcbiAgICAgIGxvZ2dlcjpcbiAgICAgICAgKHBhcmVudCAmJiBwYXJlbnQubG9nZ2VyICYmIHBhcmVudC5sb2dnZXIuY3JlYXRlQ2hpbGQoc2NoZW1hdGljLmRlc2NyaXB0aW9uLm5hbWUpKSB8fFxuICAgICAgICBuZXcgbG9nZ2luZy5OdWxsTG9nZ2VyKCksXG4gICAgICBzY2hlbWF0aWMsXG4gICAgICBzdHJhdGVneTpcbiAgICAgICAgcGFyZW50ICYmIHBhcmVudC5zdHJhdGVneSAhPT0gdW5kZWZpbmVkID8gcGFyZW50LnN0cmF0ZWd5IDogdGhpcy5kZWZhdWx0TWVyZ2VTdHJhdGVneSxcbiAgICAgIGludGVyYWN0aXZlLFxuICAgICAgYWRkVGFzayxcbiAgICB9O1xuXG4gICAgY29uc3QgbWF5YmVOZXdDb250ZXh0ID0gdGhpcy5faG9zdC50cmFuc2Zvcm1Db250ZXh0KGNvbnRleHQpO1xuICAgIGlmIChtYXliZU5ld0NvbnRleHQpIHtcbiAgICAgIGNvbnRleHQgPSBtYXliZU5ld0NvbnRleHQ7XG4gICAgfVxuXG4gICAgY29uc3QgdGFza1NjaGVkdWxlciA9IG5ldyBUYXNrU2NoZWR1bGVyKGNvbnRleHQpO1xuICAgIGNvbnN0IGhvc3QgPSB0aGlzLl9ob3N0O1xuICAgIHRoaXMuX3Rhc2tTY2hlZHVsZXJzLnB1c2godGFza1NjaGVkdWxlcik7XG5cbiAgICBmdW5jdGlvbiBhZGRUYXNrPFQgZXh0ZW5kcyBvYmplY3Q+KFxuICAgICAgdGFzazogVGFza0NvbmZpZ3VyYXRpb25HZW5lcmF0b3I8VD4sXG4gICAgICBkZXBlbmRlbmNpZXM/OiBBcnJheTxUYXNrSWQ+LFxuICAgICk6IFRhc2tJZCB7XG4gICAgICBjb25zdCBjb25maWcgPSB0YXNrLnRvQ29uZmlndXJhdGlvbigpO1xuXG4gICAgICBpZiAoIWhvc3QuaGFzVGFza0V4ZWN1dG9yKGNvbmZpZy5uYW1lKSkge1xuICAgICAgICB0aHJvdyBuZXcgVW5yZWdpc3RlcmVkVGFza0V4Y2VwdGlvbihjb25maWcubmFtZSwgc2NoZW1hdGljLmRlc2NyaXB0aW9uKTtcbiAgICAgIH1cblxuICAgICAgY29uZmlnLmRlcGVuZGVuY2llcyA9IGNvbmZpZy5kZXBlbmRlbmNpZXMgfHwgW107XG4gICAgICBpZiAoZGVwZW5kZW5jaWVzKSB7XG4gICAgICAgIGNvbmZpZy5kZXBlbmRlbmNpZXMudW5zaGlmdCguLi5kZXBlbmRlbmNpZXMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGFza1NjaGVkdWxlci5zY2hlZHVsZShjb25maWcpO1xuICAgIH1cblxuICAgIHJldHVybiBjb250ZXh0O1xuICB9XG5cbiAgY3JlYXRlU2NoZW1hdGljKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBjb2xsZWN0aW9uOiBDb2xsZWN0aW9uPENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPixcbiAgICBhbGxvd1ByaXZhdGUgPSBmYWxzZSxcbiAgKTogU2NoZW1hdGljPENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPiB7XG4gICAgY29uc3Qgc2NoZW1hdGljTWFwID0gdGhpcy5fc2NoZW1hdGljQ2FjaGUuZ2V0KGNvbGxlY3Rpb24pO1xuXG4gICAgbGV0IHNjaGVtYXRpYyA9IHNjaGVtYXRpY01hcD8uZ2V0KG5hbWUpO1xuICAgIGlmIChzY2hlbWF0aWMpIHtcbiAgICAgIHJldHVybiBzY2hlbWF0aWM7XG4gICAgfVxuXG4gICAgbGV0IGNvbGxlY3Rpb25EZXNjcmlwdGlvbiA9IGNvbGxlY3Rpb24uZGVzY3JpcHRpb247XG4gICAgbGV0IGRlc2NyaXB0aW9uID0gdGhpcy5faG9zdC5jcmVhdGVTY2hlbWF0aWNEZXNjcmlwdGlvbihuYW1lLCBjb2xsZWN0aW9uLmRlc2NyaXB0aW9uKTtcbiAgICBpZiAoIWRlc2NyaXB0aW9uKSB7XG4gICAgICBpZiAoY29sbGVjdGlvbi5iYXNlRGVzY3JpcHRpb25zKSB7XG4gICAgICAgIGZvciAoY29uc3QgYmFzZSBvZiBjb2xsZWN0aW9uLmJhc2VEZXNjcmlwdGlvbnMpIHtcbiAgICAgICAgICBkZXNjcmlwdGlvbiA9IHRoaXMuX2hvc3QuY3JlYXRlU2NoZW1hdGljRGVzY3JpcHRpb24obmFtZSwgYmFzZSk7XG4gICAgICAgICAgaWYgKGRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICBjb2xsZWN0aW9uRGVzY3JpcHRpb24gPSBiYXNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIWRlc2NyaXB0aW9uKSB7XG4gICAgICAgIC8vIFJlcG9ydCB0aGUgZXJyb3IgZm9yIHRoZSB0b3AgbGV2ZWwgc2NoZW1hdGljIGNvbGxlY3Rpb25cbiAgICAgICAgdGhyb3cgbmV3IFVua25vd25TY2hlbWF0aWNFeGNlcHRpb24obmFtZSwgY29sbGVjdGlvbi5kZXNjcmlwdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRlc2NyaXB0aW9uLnByaXZhdGUgJiYgIWFsbG93UHJpdmF0ZSkge1xuICAgICAgdGhyb3cgbmV3IFByaXZhdGVTY2hlbWF0aWNFeGNlcHRpb24obmFtZSwgY29sbGVjdGlvbi5kZXNjcmlwdGlvbik7XG4gICAgfVxuXG4gICAgY29uc3QgZmFjdG9yeSA9IHRoaXMuX2hvc3QuZ2V0U2NoZW1hdGljUnVsZUZhY3RvcnkoZGVzY3JpcHRpb24sIGNvbGxlY3Rpb25EZXNjcmlwdGlvbik7XG4gICAgc2NoZW1hdGljID0gbmV3IFNjaGVtYXRpY0ltcGw8Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+KGRlc2NyaXB0aW9uLCBmYWN0b3J5LCBjb2xsZWN0aW9uLCB0aGlzKTtcblxuICAgIHNjaGVtYXRpY01hcD8uc2V0KG5hbWUsIHNjaGVtYXRpYyk7XG5cbiAgICByZXR1cm4gc2NoZW1hdGljO1xuICB9XG5cbiAgbGlzdFNjaGVtYXRpY05hbWVzKFxuICAgIGNvbGxlY3Rpb246IENvbGxlY3Rpb248Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+LFxuICAgIGluY2x1ZGVIaWRkZW4/OiBib29sZWFuLFxuICApOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgbmFtZXMgPSB0aGlzLl9ob3N0Lmxpc3RTY2hlbWF0aWNOYW1lcyhjb2xsZWN0aW9uLmRlc2NyaXB0aW9uLCBpbmNsdWRlSGlkZGVuKTtcblxuICAgIGlmIChjb2xsZWN0aW9uLmJhc2VEZXNjcmlwdGlvbnMpIHtcbiAgICAgIGZvciAoY29uc3QgYmFzZSBvZiBjb2xsZWN0aW9uLmJhc2VEZXNjcmlwdGlvbnMpIHtcbiAgICAgICAgbmFtZXMucHVzaCguLi50aGlzLl9ob3N0Lmxpc3RTY2hlbWF0aWNOYW1lcyhiYXNlLCBpbmNsdWRlSGlkZGVuKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGR1cGxpY2F0ZXNcbiAgICByZXR1cm4gWy4uLm5ldyBTZXQobmFtZXMpXS5zb3J0KCk7XG4gIH1cblxuICB0cmFuc2Zvcm1PcHRpb25zPE9wdGlvblQgZXh0ZW5kcyBvYmplY3QsIFJlc3VsdFQgZXh0ZW5kcyBvYmplY3Q+KFxuICAgIHNjaGVtYXRpYzogU2NoZW1hdGljPENvbGxlY3Rpb25ULCBTY2hlbWF0aWNUPixcbiAgICBvcHRpb25zOiBPcHRpb25ULFxuICAgIGNvbnRleHQ/OiBUeXBlZFNjaGVtYXRpY0NvbnRleHQ8Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+LFxuICApOiBPYnNlcnZhYmxlPFJlc3VsdFQ+IHtcbiAgICByZXR1cm4gdGhpcy5faG9zdC50cmFuc2Zvcm1PcHRpb25zPE9wdGlvblQsIFJlc3VsdFQ+KHNjaGVtYXRpYy5kZXNjcmlwdGlvbiwgb3B0aW9ucywgY29udGV4dCk7XG4gIH1cblxuICBjcmVhdGVTb3VyY2VGcm9tVXJsKHVybDogVXJsLCBjb250ZXh0OiBUeXBlZFNjaGVtYXRpY0NvbnRleHQ8Q29sbGVjdGlvblQsIFNjaGVtYXRpY1Q+KTogU291cmNlIHtcbiAgICBzd2l0Y2ggKHVybC5wcm90b2NvbCkge1xuICAgICAgY2FzZSAnbnVsbDonOlxuICAgICAgICByZXR1cm4gKCkgPT4gbmV3IE51bGxUcmVlKCk7XG4gICAgICBjYXNlICdlbXB0eTonOlxuICAgICAgICByZXR1cm4gKCkgPT4gZW1wdHkoKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnN0IGhvc3RTb3VyY2UgPSB0aGlzLl9ob3N0LmNyZWF0ZVNvdXJjZUZyb21VcmwodXJsLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKCFob3N0U291cmNlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFVua25vd25VcmxTb3VyY2VQcm90b2NvbCh1cmwudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaG9zdFNvdXJjZTtcbiAgICB9XG4gIH1cblxuICBleGVjdXRlUG9zdFRhc2tzKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIGNvbnN0IGV4ZWN1dG9ycyA9IG5ldyBNYXA8c3RyaW5nLCBUYXNrRXhlY3V0b3I+KCk7XG5cbiAgICBjb25zdCB0YXNrT2JzZXJ2YWJsZSA9IG9ic2VydmFibGVGcm9tKHRoaXMuX3Rhc2tTY2hlZHVsZXJzKS5waXBlKFxuICAgICAgY29uY2F0TWFwKChzY2hlZHVsZXIpID0+IHNjaGVkdWxlci5maW5hbGl6ZSgpKSxcbiAgICAgIGNvbmNhdE1hcCgodGFzaykgPT4ge1xuICAgICAgICBjb25zdCB7IG5hbWUsIG9wdGlvbnMgfSA9IHRhc2suY29uZmlndXJhdGlvbjtcblxuICAgICAgICBjb25zdCBleGVjdXRvciA9IGV4ZWN1dG9ycy5nZXQobmFtZSk7XG4gICAgICAgIGlmIChleGVjdXRvcikge1xuICAgICAgICAgIHJldHVybiBleGVjdXRvcihvcHRpb25zLCB0YXNrLmNvbnRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2hvc3QuY3JlYXRlVGFza0V4ZWN1dG9yKG5hbWUpLnBpcGUoXG4gICAgICAgICAgY29uY2F0TWFwKChleGVjdXRvcikgPT4ge1xuICAgICAgICAgICAgZXhlY3V0b3JzLnNldChuYW1lLCBleGVjdXRvcik7XG5cbiAgICAgICAgICAgIHJldHVybiBleGVjdXRvcihvcHRpb25zLCB0YXNrLmNvbnRleHQpO1xuICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgfSksXG4gICAgKTtcblxuICAgIHJldHVybiB0YXNrT2JzZXJ2YWJsZTtcbiAgfVxufVxuIl19