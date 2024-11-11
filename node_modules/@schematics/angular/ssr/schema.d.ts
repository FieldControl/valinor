export interface Schema {
    /**
     * The name of the project.
     */
    project: string;
    /**
     * Skip installing dependency packages.
     */
    skipInstall?: boolean;
}
