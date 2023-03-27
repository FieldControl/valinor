"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommandModuleToYargs = exports.demandCommandFailureMessage = void 0;
const command_module_1 = require("../command-module");
exports.demandCommandFailureMessage = `You need to specify a command before moving on. Use '--help' to view the available commands.`;
function addCommandModuleToYargs(localYargs, commandModule, context) {
    const cmd = new commandModule(context);
    const { args: { options: { jsonHelp }, }, workspace, } = context;
    const describe = jsonHelp ? cmd.fullDescribe : cmd.describe;
    return localYargs.command({
        command: cmd.command,
        aliases: cmd.aliases,
        describe: 
        // We cannot add custom fields in help, such as long command description which is used in AIO.
        // Therefore, we get around this by adding a complex object as a string which we later parse when generating the help files.
        typeof describe === 'object' ? JSON.stringify(describe) : describe,
        deprecated: cmd.deprecated,
        builder: (argv) => {
            // Skip scope validation when running with '--json-help' since it's easier to generate the output for all commands this way.
            const isInvalidScope = !jsonHelp &&
                ((cmd.scope === command_module_1.CommandScope.In && !workspace) ||
                    (cmd.scope === command_module_1.CommandScope.Out && workspace));
            if (isInvalidScope) {
                throw new command_module_1.CommandModuleError(`This command is not available when running the Angular CLI ${workspace ? 'inside' : 'outside'} a workspace.`);
            }
            return cmd.builder(argv);
        },
        handler: (args) => cmd.handler(args),
    });
}
exports.addCommandModuleToYargs = addCommandModuleToYargs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2FuZ3VsYXIvY2xpL3NyYy9jb21tYW5kLWJ1aWxkZXIvdXRpbGl0aWVzL2NvbW1hbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsc0RBTTJCO0FBRWQsUUFBQSwyQkFBMkIsR0FBRyw4RkFBOEYsQ0FBQztBQUUxSSxTQUFnQix1QkFBdUIsQ0FLckMsVUFBbUIsRUFBRSxhQUFnQixFQUFFLE9BQXVCO0lBQzlELE1BQU0sR0FBRyxHQUFHLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLE1BQU0sRUFDSixJQUFJLEVBQUUsRUFDSixPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsR0FDdEIsRUFDRCxTQUFTLEdBQ1YsR0FBRyxPQUFPLENBQUM7SUFFWixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7SUFFNUQsT0FBTyxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQ3hCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztRQUNwQixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87UUFDcEIsUUFBUTtRQUNOLDhGQUE4RjtRQUM5Riw0SEFBNEg7UUFDNUgsT0FBTyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRO1FBQ3BFLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVTtRQUMxQixPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNoQiw0SEFBNEg7WUFDNUgsTUFBTSxjQUFjLEdBQ2xCLENBQUMsUUFBUTtnQkFDVCxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyw2QkFBWSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDNUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLDZCQUFZLENBQUMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFbkQsSUFBSSxjQUFjLEVBQUU7Z0JBQ2xCLE1BQU0sSUFBSSxtQ0FBa0IsQ0FDMUIsOERBQ0UsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQ3pCLGVBQWUsQ0FDaEIsQ0FBQzthQUNIO1lBRUQsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBWSxDQUFDO1FBQ3RDLENBQUM7UUFDRCxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0tBQ3JDLENBQUMsQ0FBQztBQUNMLENBQUM7QUEzQ0QsMERBMkNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IEFyZ3YgfSBmcm9tICd5YXJncyc7XG5pbXBvcnQge1xuICBDb21tYW5kQ29udGV4dCxcbiAgQ29tbWFuZE1vZHVsZSxcbiAgQ29tbWFuZE1vZHVsZUVycm9yLFxuICBDb21tYW5kTW9kdWxlSW1wbGVtZW50YXRpb24sXG4gIENvbW1hbmRTY29wZSxcbn0gZnJvbSAnLi4vY29tbWFuZC1tb2R1bGUnO1xuXG5leHBvcnQgY29uc3QgZGVtYW5kQ29tbWFuZEZhaWx1cmVNZXNzYWdlID0gYFlvdSBuZWVkIHRvIHNwZWNpZnkgYSBjb21tYW5kIGJlZm9yZSBtb3Zpbmcgb24uIFVzZSAnLS1oZWxwJyB0byB2aWV3IHRoZSBhdmFpbGFibGUgY29tbWFuZHMuYDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFkZENvbW1hbmRNb2R1bGVUb1lhcmdzPFxuICBUIGV4dGVuZHMgb2JqZWN0LFxuICBVIGV4dGVuZHMgUGFydGlhbDxDb21tYW5kTW9kdWxlSW1wbGVtZW50YXRpb24+ICYge1xuICAgIG5ldyAoY29udGV4dDogQ29tbWFuZENvbnRleHQpOiBQYXJ0aWFsPENvbW1hbmRNb2R1bGVJbXBsZW1lbnRhdGlvbj4gJiBDb21tYW5kTW9kdWxlO1xuICB9LFxuPihsb2NhbFlhcmdzOiBBcmd2PFQ+LCBjb21tYW5kTW9kdWxlOiBVLCBjb250ZXh0OiBDb21tYW5kQ29udGV4dCk6IEFyZ3Y8VD4ge1xuICBjb25zdCBjbWQgPSBuZXcgY29tbWFuZE1vZHVsZShjb250ZXh0KTtcbiAgY29uc3Qge1xuICAgIGFyZ3M6IHtcbiAgICAgIG9wdGlvbnM6IHsganNvbkhlbHAgfSxcbiAgICB9LFxuICAgIHdvcmtzcGFjZSxcbiAgfSA9IGNvbnRleHQ7XG5cbiAgY29uc3QgZGVzY3JpYmUgPSBqc29uSGVscCA/IGNtZC5mdWxsRGVzY3JpYmUgOiBjbWQuZGVzY3JpYmU7XG5cbiAgcmV0dXJuIGxvY2FsWWFyZ3MuY29tbWFuZCh7XG4gICAgY29tbWFuZDogY21kLmNvbW1hbmQsXG4gICAgYWxpYXNlczogY21kLmFsaWFzZXMsXG4gICAgZGVzY3JpYmU6XG4gICAgICAvLyBXZSBjYW5ub3QgYWRkIGN1c3RvbSBmaWVsZHMgaW4gaGVscCwgc3VjaCBhcyBsb25nIGNvbW1hbmQgZGVzY3JpcHRpb24gd2hpY2ggaXMgdXNlZCBpbiBBSU8uXG4gICAgICAvLyBUaGVyZWZvcmUsIHdlIGdldCBhcm91bmQgdGhpcyBieSBhZGRpbmcgYSBjb21wbGV4IG9iamVjdCBhcyBhIHN0cmluZyB3aGljaCB3ZSBsYXRlciBwYXJzZSB3aGVuIGdlbmVyYXRpbmcgdGhlIGhlbHAgZmlsZXMuXG4gICAgICB0eXBlb2YgZGVzY3JpYmUgPT09ICdvYmplY3QnID8gSlNPTi5zdHJpbmdpZnkoZGVzY3JpYmUpIDogZGVzY3JpYmUsXG4gICAgZGVwcmVjYXRlZDogY21kLmRlcHJlY2F0ZWQsXG4gICAgYnVpbGRlcjogKGFyZ3YpID0+IHtcbiAgICAgIC8vIFNraXAgc2NvcGUgdmFsaWRhdGlvbiB3aGVuIHJ1bm5pbmcgd2l0aCAnLS1qc29uLWhlbHAnIHNpbmNlIGl0J3MgZWFzaWVyIHRvIGdlbmVyYXRlIHRoZSBvdXRwdXQgZm9yIGFsbCBjb21tYW5kcyB0aGlzIHdheS5cbiAgICAgIGNvbnN0IGlzSW52YWxpZFNjb3BlID1cbiAgICAgICAgIWpzb25IZWxwICYmXG4gICAgICAgICgoY21kLnNjb3BlID09PSBDb21tYW5kU2NvcGUuSW4gJiYgIXdvcmtzcGFjZSkgfHxcbiAgICAgICAgICAoY21kLnNjb3BlID09PSBDb21tYW5kU2NvcGUuT3V0ICYmIHdvcmtzcGFjZSkpO1xuXG4gICAgICBpZiAoaXNJbnZhbGlkU2NvcGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRNb2R1bGVFcnJvcihcbiAgICAgICAgICBgVGhpcyBjb21tYW5kIGlzIG5vdCBhdmFpbGFibGUgd2hlbiBydW5uaW5nIHRoZSBBbmd1bGFyIENMSSAke1xuICAgICAgICAgICAgd29ya3NwYWNlID8gJ2luc2lkZScgOiAnb3V0c2lkZSdcbiAgICAgICAgICB9IGEgd29ya3NwYWNlLmAsXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjbWQuYnVpbGRlcihhcmd2KSBhcyBBcmd2PFQ+O1xuICAgIH0sXG4gICAgaGFuZGxlcjogKGFyZ3MpID0+IGNtZC5oYW5kbGVyKGFyZ3MpLFxuICB9KTtcbn1cbiJdfQ==