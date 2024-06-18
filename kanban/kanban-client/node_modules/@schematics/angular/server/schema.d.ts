/**
 * Pass this schematic to the "run" command to set up server-side rendering for an app.
 */
export interface Schema {
    /**
     * The name of the project.
     */
    project: string;
    /**
     * Do not install packages for dependencies.
     */
    skipInstall?: boolean;
}
