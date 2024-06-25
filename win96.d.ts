/**
 * Windows 96 API typings.
 * Copyright (C) windows96.net 2021.
 * 
 * API golden rules and guidelines:
 *  - Read the JSDoc carefully to know what each item does.
 *  - Read the API examples to get an idea of how to use some APIs effectively.
 *  - If there are errors in this typings document, let us know.
 *  - Refrain from using [internal] functions as they are not meant to be used by the user.
 *  - Do not use [undocumented] functions.
 */

/**
 * Base file system interface.
 */
interface IFileSystem {
    new(prefix: String);

    /**
     * Whether the file system has resources to be accessed remotely.
     */
    remote: Boolean;

    /**
     * The prefix (aka drive letter) for the current file system instance.
     * 
     * This is managed by the OS.
     */
    prefix: String;

    /**
     * The volume label.
     */
    volumeLabel: String;

    /**
     * The unique driver name.
     */
    driverName: String;

    /**
     * An array which contains the supported file system features.
     */
    features: [];

    /**
     * Initializes the file system.
     */
    init(): Promise<void>;

    /**
     * Called when the file system is being unmounted.
     */
    uninit(): Promise<void>;

    /**
     * Checks if the specified entity is a file.
     * @param {String} path The path to check for.
     */
    isFile(path: String): Boolean;

    /**
     * Checks if a file is empty.
     * @param {String} path The path to check for.
     */
    isEmpty(path: String): Boolean;

    /**
     * Returns a list of entities contained in the specified path.
     * @param {String} path The directory path to read.
     */
    readdir(path: String): String[];

     /**
      * Copies a directory to a new destination.
      * @param {String} src The source path to copy from.
      * @param {String} dest The destination path to place copied files.
      */
    cpdir(src: String, dest: String): Promise<Boolean>;
 
     /**
      * Copies a file to a new destination.
      * @param {String} src The source path to copy from.
      * @param {String} dest The destination path to place the copied file.
      */
    cpfile(src: String, dest: String): Promise<Boolean>;
 
     /**
      * Moves a file to a new destination.
      * @param {String} src The source path to move from.
      * @param {String} dest The destination path to place the moved file.
      */
    mvfile(src: String, dest: String): Promise<Boolean>;
     
     /**
      * Moves a directory to a new destination.
      * @param {String} src The source path to move from.
      * @param {String} dest The destination path to place moved files.
      */
    mvdir(src: String, dest: String): Promise<Boolean>;
 
     /**
      * Checks if an entity exists.
      * @param {String} path The path to check for.
      */
    exists(path: String): Boolean;
 
     /**
      * Reads the specified file as a string.
      * @param {String} path The path of the file to read.
      */
    readstr(path: String): Promise<String>;
 
     /**
      * Reads the specified file as binary.
      * @param {String} path The path of the file to read.
      */
    readbin(path: String): Promise<Uint8Array>;
 
     /**
      * Returns the file type of a node. This can be a binary or text file.
      * @param {String} path The path to check for.
      * @returns {1|0|-1} A number representing the file type.
      */
    filetype(path: String): 1|0|-1;
 
     /**
      * Truncates and writes a UTF-8 encoded string to the specified file.
      * @param {String} path The path of the file to write to.
      * @param {String} data The string to write.
      */
    writestr(path: String, data: String): Promise<Boolean>;
 
     /**
      * Truncates and writes data to the specified file.
      * @param {String} path The path of the file to write to.
      * @param {Number[]|Uint8Array} data The data to write.
      */
    writebin(path: String, data: Number[]|Uint8Array): Promise<Boolean>; 
}

/**
 * Indexed File System driver.
 * 
 * Can be inherited for custom implementations.
 * Used by Windows 96 to map as `c:/`
 */
interface IndexedFileSystem extends IFileSystem {
    _fileTable: {
        "/": {
            length: Number,
            dateAccessed: Number,
            dateModified: Number,
            dateCreated: Number,
            readOnly: Boolean,
            type: Number,
            recordId: String
        }
    }

    _fsSort: Boolean;
    driverName: "idbfs";

    /**
     * Retrieves a value from the specified IDB key.
     * @param {String} _k The key to retrieve.
     */
    _getItem(_k: String): Promise<Uint8Array>;

    /**
     * Sets a key value in IDB.
     * @param {String} k The key to use.
     * @param {*} v The value to set. 
     */
    _setItem(k: String, v: any): void;

    /**
     * Pushes a file table record.
     * @param {String} path The path of the entity to push.
     * @param {Number} size The entity size.
     * @param {Number} type The entity type.
     * @param {Boolean} readOnly Whether the entity is read only.
     */
    _pushFtableRecord(path: String, size: Number, type: Number, readOnly: Boolean): void;

    /**
     * Check if an entity exists in the file table.
     * @param {String} path The path to check for.
     */
    _fTableExists(path): Boolean;

    /**
     * Pauses IDB sync.
     */
    _pauseSync(): void;

    /**
     * Resumes IDB sync.
     */
    _resumeSync(): void;

    /**
     * Syncs the file table to IDB.
     */
    _sync(): Promise<void>;

    /**
     * [undocumented function]
     */
    _intmkf(): Boolean;
}

/**
 * Fake local storage object.
 */
interface FakeLocalStorage {
    new(data: Array<any>);
    
    /**
     * Returns an item value.
     * @param {String} key The key to resolve the value for.
     */
    getItem(key: String): String;

    /**
     * Sets a key value.
     * @param {String} key The key to set the value for.
     * @param {String} value The value to set.
     */
    setItem(key: String, value: any): void;

    /**
     * Removes an item.
     * @param {String} key The item key.
     */
    removeItem(key: String): void;

    /**
     * Clears all items.
     */
    clear(): void;
}

/**
 * Ramdrive file system driver.
 */
interface RamFileSystem extends IndexedFileSystem {
    store: FakeLocalStorage
}

/**
 * Local storage file system driver.
 */
interface LocalStorageFileSystem extends IndexedFileSystem {}

/**
 * Read only (remote) file system driver.
 * 
 * Used by W:/ (the true system drive).
 */
interface RemoteReadOnlyFileSystem extends IFileSystem {
    new(prefix: String, schemaPath: String);

    fileTable: {
        "/": {
            length: Number,
            type: Number
        }
    };

    readOnly: true;
    remote: true;
    schemaPath: String;
    origin: String;
}

/**
 * FS Stat object.
 */
interface FSStatResult {
    recordId: String;
    length: Number;
    readOnly: Boolean;
}

/**
 * Windows 96 File System object.
 */
interface FS {
    /**
     * Mounts a file system using the specified object ("driver").
     * @param {IFileSystem} fso The file system object to mount.
     */
    mount(fso: IFileSystem): Promise<void>;

    /**
     * Unmounts a file system instance.
     * @param {String} prefix The prefix of the file system instance to unmount.
     */
    umount(prefix: String): Promise<void>;

    /**
     * Gets all mounted file systems.
     * @returns {IFileSystem[]} The file systems.
     */
    mounts(): IFileSystem[];

    /**
     * Gets all mounted file system prefixes.
     */
    list(): String[];

    /**
     * Get the next available drive letter.
     * @returns {String} The next available letter or null if nothing was found.
     */
    nextLetter(): String;

    /**
     * Constructs a blob from the specified file.
     * @param {String} path The path of the file to construct a blob from.
     */
    toBlob(path: String): Promise<Blob>;

    /**
     * Retuns a file system by its prefix.
     * @param {String} prefix The prefix to use.
     * @returns {IFileSystem} The file system.
     */
    get(prefix: String): IFileSystem;

    /**
     * [ Internal function - use is discouraged. ]
     * Invokes a function on a class implementing IFileSystem.
     * @param {String} path A reference path to use for thrown error objects.
     * @param {String} prefix The prefix of the file system to use.
     * @param {String} func_name The function to invoke.
     */
    _invokeFsFunc(path: String, prefix: String, func_name: String) : any;

    /**
     * Checks if the specified entity is a file.
     * @param {String} path The path to check for.
     */
    isFile(path: String): Boolean;

    /**
     * Checks if a file is empty.
     * @param {String} path The path to check for.
     */
    isEmpty(path: String): Boolean;

    /**
     * Creates a new directory (and subdirectories if they do not exist).
     * @param {String} path The path of the directory to create.
     */
    mkdir(path: String): Boolean;

    /**
     * Removes a directory and its contents.
     * @param {String} path The path of the directory to remove.
     */
    rmdir(path: String): Promise<Boolean>;

    /**
     * Creates a new file.
     * @param {String} path The path of the file to create.
     */
    touch(path: String): Boolean;

    /**
     * Deletes the specified file.
     * @param {String} path The path of the file to remove.
     */
    rm(path: String): Boolean;

    /**
     * Returns a list of entities contained in the specified path.
     * @param {String} path The directory path to read.
     */
    readdir(path: String): String[];

    /**
     * Copies a directory to a new destination.
     * @param {String} src The source path to copy from.
     * @param {String} dest The destination path to place copied files.
     */
    cpdir(src: String, dest: String): Promise<Boolean>;

    /**
     * Copies a file to a new destination.
     * @param {String} src The source path to copy from.
     * @param {String} dest The destination path to place the copied file.
     */
    cpfile(src: String, dest: String): Promise<Boolean>;

    /**
     * Moves a file to a new destination.
     * @param {String} src The source path to move from.
     * @param {String} dest The destination path to place the moved file.
     */
    mvfile(src: String, dest: String): Promise<Boolean>;
    
    /**
     * Moves a directory to a new destination.
     * @param {String} src The source path to move from.
     * @param {String} dest The destination path to place moved files.
     */
    mvdir(src: String, dest: String): Promise<Boolean>;

    /**
     * Checks if an entity exists.
     * @param {String} path The path to check for.
     */
    exists(path: String): Boolean;

    /**
     * Reads the specified file as a string.
     * @param {String} path The path of the file to read.
     */
    readstr(path: String): Promise<String>;

    /**
     * Reads the specified file as binary.
     * @param {String} path The path of the file to read.
     */
    readbin(path: String): Promise<Uint8Array>;

    /**
     * Returns the file type of a node. This can be a binary or text file.
     * @param {String} path The path to check for.
     * @returns {1|0|-1} A number representing the file type.
     */
    filetype(path: String): 1|0|-1;

    /**
     * Truncates and writes a UTF-8 encoded string to the specified file.
     * @param {String} path The path of the file to write to.
     * @param {String} data The string to write.
     */
    writestr(path: String, data: String): Promise<Boolean>;

    /**
     * Truncates and writes data to the specified file.
     * @param {String} path The path of the file to write to.
     * @param {Number[]|Uint8Array} data The data to write.
     */
    writebin(path: String, data: Number[]|Uint8Array): Promise<Boolean>;

    /**
     * Walks through the contents of a directory.
     * @param {String} path The path to walk.
     */
    walk(path: String): String[];

    /**
     * Retrieves information about a file system entry.
     * @param {String} path The path to retrieve information for.
     */
    stat(path: String): FSStatResult;

    /**
     * Renames a file or folder.
     * @param {String} path The path to rename.
     * @param {String} newName The new name of the directory/file to use.
     */
    rename(path: String, newName: String): Promise<Boolean>;
}

/**
 * File system utilities.
 */
interface FSUtil {
    /**
     * Returns the parent path of a path.
     * @param {String} path The path to resolve for.
     */
    getParentPath(path: String): String;

    /**
     * Returns the file name of a path.
     * @param {String} path The path to return the filename for.
     */
    fname(path: String): String;

    /**
     * Resolves a path.
     * @param {String} basePath The base path.
     * @param {String} path The path to resolve.
     */
    resolvePath(basePath: String, path: String): String;

    /**
     * Extracts the prefix and path from a path string.
     * @param {String} _fp The file path to use.
     */
    deconstructFullPath(_fp: String): {
        prefix: String,
        path: String
    }

    /**
     * Returns the file extension of a path.
     * @param {String} path The path to extract the extension of.
     */
    getExtension(path: String): String;

    /**
     * Downloads a file to the user hard disk.
     * @param {String} path The path to download.
     */
    downloadFile(path: String): Promise<void>;
}

/**
 * An object used to represent the initial properties of a window.
 * 
 * Used for window creation.
 */
interface WindowParams {
    new();

    /**
     * The initial X (left) position of the window in pixels.
     */
    initialX: Number;

    /**
     * The initial Y (top) position of the window in pixels.
     */
    initialY: Number;

    /**
     * The minimum required height for the window.
     */
    minHeight: Number;

    /**
     * The minimum required width for the window.
     */
    minWidth: Number;

    /**
     * The initial height of the window.
     */
    initialHeight: Number;

    /**
     * The initial width of the window.
     */
    initialWidth: Number;

    /**
     * The title of the window.
     */
    title: String;

    /**
     * Whether the window is allowed to be resized.
     */
    resizable: Boolean;

    /**
     * Whether the window is allowed to be dragged around.
     */
    draggable: Boolean;

    /**
     * Whether to display the window in the taskbar.
     */
    taskbar: Boolean;

    /**
     * The URL path of the window icon.
     * 
     * You can use `w96.ui.Theme.getIconUrl()` to use a standard icon from the current theme.
     */
    icon: String;

    /**
     * Whether to center the window upon being shown.
     */
    center: Boolean;

    /**
     * The HTML to set as the window contents.
     */
    body: String;

    /**
     * The CSS class to assign to the window body.
     */
    bodyClass: String;

    /**
     * The CSS class to assign to the window.
     * 
     * This is not recommended, use the body class instead unless you absolutely need to apply custom styles to the window itself.
     */
    windowClass: String;

    /**
     * The control box style (aka window buttons) style to use.
     */
    controlBoxStyle: "WS_CBX_MINMAXCLOSE"|"WS_CBX_CLOSE"|"WS_CBX_MINCLOSE"|"WS_CBX_NONE";
    
    /**
     * Whether to make the window auto-maximize on mobile devices.
     */
    mobResize: Boolean;

    /**
     * Whether to fix iframes.
     */
    iframeFix: Boolean;

    /**
     * The animations to use for this window.
     */
    animations: {
        windowOpen: String,
        windowClose: String
    };

    /**
     * [undocumented]
     */
    wndContainer: HTMLDivElement
}

/**
 * Represents a window in the OS.
 */
interface StandardWindow {
    new(params: WindowParams);

    /**
     * The window ID.
     */
    readonly id: String;
    readonly useIcon: Boolean;
    readonly wndObject: HTMLDivElement;
    readonly animations: {};
    readonly params: WindowParams;
    readonly isRegistered: Boolean;
    readonly appbarRegistered: Boolean;
    readonly shown: Boolean;
    readonly _wmStylingAllowed: Boolean;
    readonly maximized: Boolean;
    readonly minimized: Boolean;
    readonly uiUpdating: Boolean;
    readonly windowIcon: String;
    readonly title: String;
    readonly maximizeInfo: {
        x: String,
        y: String,
        h: String,
        w: String
    };

    /**
     * Event executed on window close.
     */
    onclose: (e: {
        /**
         * Whether to cancel window closure.
         */
        canceled: Boolean
    }) => void;

    /**
     * Event executed on window load.
     */
    onload: ()=>void;

    /**
     * Event executed on window deactivation.
     */
    ondarkenelements: ()=>void;

    /**
     * Event executed on window activation.
     */
    onlightenelements: ()=>void;

    _ext: {
        windowSnap: {
            snapped: Boolean,
            originalSize: null
        }
    }

    /**
     * Shows the titlebar menu
     * @param {MouseEvent} e The mouse event
     */
    showTitlebarMenu(e: MouseEvent): void;

    /**
     * Registers the window.
     * 
     * For internal use only - user call not recommended.
     */
    registerWindow(): void;

    /**
     * Registers the application bar (taskbar item) for this window.
     */
    registerAppBar(): void;

    /**
     * Sets the title of the window.
     * @param {String} text The text to use as title.
     */
    setTitle(text: String): void;

    /**
     * Sets the window HTML contents.
     * @param {String} text The HTML text to use.
     */
    setHtml(text: String): void;

    /**
     * Randomizes the window position.
     */
    randomizePosition(): void;

    /**
     * Shows the window.
     */
    show(): void;

    /**
     * Centers the window.
     */
    center(current: Boolean): void;

    /**
     * Activates the window.
     */
    activate(): void;

    /**
     * Minimizes the window.
     */
    toggleMinimize(): void;

    /**
     * Toggles whether the window is maximized or not.
     */
    toggleMaximize(): void;

    /**
     * Closes the window.
     * @param {Boolean} ignoreEvents Whether to ignore window events.
     */
    close(ignoreEvents: Boolean): void;

    /**
     * Darkens all UI elements when a window is about to be deactivated.
     * 
     * User call not recommended.
     */
    darkenElements(): void;

    /**
     * Does the reverse of `darkenElements()`.
     * 
     * User call not recommended.
     */
    lightenElements(): void;

    /**
     * Sets the window icon to the specified URL.
     * @param {String} icon_url The URL of the icon to use.
     */
    setWindowIcon(icon_url: String): HTMLDivElement;

    /**
     * Sets the control box style for this window. This also respects the Aero-like setting of disabling buttons rather than removing them.
     * @param {"WS_CBX_CLOSE"|"WS_CBX_MINCLOSE"|"WS_CBX_MINMAXCLOSE"|"WS_CBX_NONE"} cbstyle The control box style to use.
     */
    setControlBoxStyle(cbstyle: "WS_CBX_CLOSE"|"WS_CBX_MINCLOSE"|"WS_CBX_MINMAXCLOSE"|"WS_CBX_NONE"): void;

    /**
     * Sets a new window size.
     * @param {Number} w The new width of the window.
     * @param {Number} h The new height of the window.
     */
    setSize(w: Number, h: Number, ignoreThemeOffsets?: Boolean): void;

    /**
     * Sets the position of a window.
     * @param {Number} x The x coordinate to use.
     * @param {Number} y The y coordinate to use.
     */
    setPosition(x: Number, y: Number): void;

    /**
     * Return window bounds.
     */
    getBounds(): {
        x: Number,
        y: Number,
        height: Number,
        width: Number
    };

    /**
     * Get computed window bounds.
     */
    getComputedBounds(): DOMRect;

    /**
     * Returns the HTML container.
     */
    getBodyContainer(): HTMLDivElement;
}

/**
 * Windows 96 Window System interface.
 */
interface WindowSystem {
    /**
     * Deactivates all windows.
     */
    deactivateAllWindows(): void;

    /**
     * Sets the window container to use.
     * @param {HTMLDivElement} element The element to use as window container.
     */
    setWindowContainer(element: HTMLDivElement): void;

    /**
     * Finds a window object with the specified id.
     * @param {String} id The id of the window to find.
     * @returns {StandardWindow} The window.
     */
    findWindow(id: String): StandardWindow;

    /**
     * Returns whether a window is active.
     */
    isWindowActive(): Boolean;

    /**
     * Closes all windows.
     */
    closeAllWindows(): void;

    startZIndex: Number;
    windows: StandardWindow[];
}

/**
 * Window system window compositor object.
 * 
 * Allows for compositing of windows before they are shown to the user.
 */
interface WinCompositor {
    /**
     * Calls the compositor.
     * @param {StandardWindow} wnd The window to call the compositing functions for.
     */
    callComposite(wnd: StandardWindow): void;

    /**
     * Enable optional window compositing.
     * @param {Boolean} v
     */
    enable(v: Boolean): void;

    /**
     * Compositor event queue.
     */
    events: EventEmitter[];
}

/**
 * An object representing an event emitter queued event.
 */
interface EmitterEvent {
    /**
     * The name of the event.
     */
    name: String;

    /**
     * The event callback.
     */
    callback: Function;

    /**
     * Specifies whether the event should be recurring or single.
     */
    type: "recurring"|"single";
}

/**
 * An object which represents an event queue.
 * 
 * Similar to NodeJS event emitter.
 */
interface EventEmitter {
    eventQueue: EmitterEvent[];

    /**
     * Listens for an event.
     * @param {String} evtName The event name to listen for.
     * @param {Function} callback The callback to assign.
     */
    on(evtName: String, callback: Function): void;

    /**
     * Listens for an event once.
     * @param {String} evtName The event name to listen for.
     * @param {Function} callback The callback to assign.
     */
    once(evtName: String, callback: Function): void;

    /**
     * Fires an event.
     * @param {String} evtName The event name to fire.
     * @param {*} args The arguments to pass.
     */
    emit(evtName: String, ...args: any): void;
}

/**
 * [old api - kept for compatibility]
 * 
 * An object representing a message box.
 */
interface MessageBox {
    /**
     * Creates a message box.
     * @param {String} title The title of the message box window.
     * @param {String} message The message of the message box text.
     * @param {String} icon The icon name of the message box icon.
     * @param {String} buttons The buttons to use.
     * @param {Function} onclose The callback to call once the message box is closed.
     */
    new(title: String, message: String, icon: String, buttons: String, onclose: Function);

    /**
     * Fired when the message box is being closed.
     */
    onclose: Function;

    /**
     * The message box icon.
     */
    readonly icon: String;

    /**
     * The underlying window object for the message box.
     */
    dlg: StandardWindow;

    /**
     * Shows the message box.
     */
    show(): void;

    /**
     * Sets the size of the message box.
     * @param {Number} w The width of the message box to set.
     * @param {Number} h The height of the message box to set.
     */
    setSize(w: Number, h: Number): MessageBox;

    /**
     * Closes the window.
     */
    closeDialog(): void;
}

/**
 * Simple message box UI object.
 * 
 * Please use `DialogCreator`, this is an old API and has flaws, but is kept for compatibility.
 */
interface MsgBoxSimple {
    /**
     * [old API - use DialogCreator]
     * 
     * Shows a messagebox containing an error.
     * @param {String} title The title of the message box.
     * @param {String} message The message to display.
     * @param {String} oktext The string to display as the confirmation button caption.
     */
    error(title: String, message: String, oktext: String): MessageBox;
    
    /**
     * [old API - use DialogCreator]
     * 
     * Shows a messagebox containing a warning.
     * @param {String} title The title of the message box.
     * @param {String} message The message to display.
     * @param {String} oktext The string to display as the confirmation button caption.
     */
    warning(title: String, message: String, oktext: String): MessageBox;

    /**
     * [old API - use DialogCreator]
     * 
     * Shows a messagebox containing an informational message.
     * @param {String} title The title of the message box.
     * @param {String} message The message to display.
     * @param {String} oktext The string to display as the confirmation button caption.
     */
    info(title: String, message: String, oktext: String): MessageBox;

    /**
     * Shows a status box.
     * @param {String} title The title of the message box.
     * @param {String} message The message to display.
     */
    status(title: String, message: String): StandardWindow;

    /**
     * Shows a prompt.
     * @param {String} title The title of the prompt.
     * @param {String} message The message of the prompt.
     * @param {String} def The default message to include.
     * @param {Function} callback The callback to use once the prompt is complete.
     */
    prompt(title: String, message: String, def: String, callback: Function): StandardWindow;

    /**
     * Shows a confirmation prompt.
     * @param {String} message The message to display.
     * @param {Function} callback The callback to call.
     * @param {String} icon The icon to use.
     */
    confirm(message: String, callback: Function, icon?: String): MessageBox;

    /**
     * Shows a status box with an idle progress bar.
     * @param {String} title The title of the message box.
     * @param {String} message The message to display.
     */
    idleProgress(title: String, message: String): MessageBox;
}

/**
 * Represents a theme sound profile.
 */
interface ThemeSound {
    error: String;
    question: String;
    asterisk: String;
    ctxmenuopen: String;
    ctxmenuhover: String;
    ctxmenucmd: String;
    minimize: String;
    restore: String;
    navigate: String;
    maximize: String;
    start: String;
}

/**
 * Represents the current desktop theme.
 */
interface Theme {
    /**
     * The current theme ID. 
     */
    currentTheme: String;
    registeredThemes: {};

    /**
     * Returns the icon url for the specified icon.
     * @param {String} name The name of the icon to return a URL from.
     * @param {String} size The size of the icon to return.
     * @param {String} format The format of the icon to use.
     */
    getIconUrl(name: String, size?: String, format?: String): String;

    /**
     * Returns an icon url for the specified file or directory.
     * @param {String} filePath The path of the file/directory to retrieve an icon for.
     * @param {String} size The size of the icon to retrieve.
     * @param {String} format The format of the icon to retrieve.
     */
    getFileIconUrl(filePath: String, size?: String, format?: String): String;

    /**
     * Append CSS to system style.
     * @param {String} css The CSS to append.
     */
    cssa(css: String): void;

    /**
     * Append external CSS to system style.
     * @param {String} css The CSS url to load and append.
     */
    cssl(url: String): void;

    /**
     * UI variables.
     */
    uiVars: {
        titlebarIconPadding: "19px",
        maxWindowSizeFormulaW: "calc(100vw - 6px)",
        maxWindowSizeFormulaH: "calc(100vh - 34px)",
        defaults: {
            mbox: {
                w: 322,
                h: 110
            }
        },
        tbOffsetH: 0,
        tbOffsetW: 0,
        superbarEnabled: false
    };

    /**
     * Unload themes and reset everything.
     * @param {Boolean} reloadDesk Whether to reload the desktop. Default value is `true`.
     */
    unloadTheme(reloadDesk?: Boolean): void;

    /**
     * Reloads the desktop.
     */
    reloadDesktop(): Promise<void>;

    /**
     * Gets a sound from the current theme.
     *
     * @param {String} id The id of the sound to get
     */
    getSound(id: String): ThemeSound;

    /**
     * Shortcut for new Audio(getSound(id)).play()
     * also handles autoplay errors (if there are any)
     *
     * @param {String} id The id of the sound to play
     */
    playSound(id: String): Promise<void>;
}

/**
 * Represents a context menu item.
 */
interface ContextMenuItem {
    /**
     * The item type. Can either be `separator`, `normal`, or `submenu`.
     */
    type: "normal"|"separator"|"submenu";

    /**
     * The item label.
     */
    label?: String;

    /**
     * The item icon URL.
     */
    icon?: String;

    /**
     * Fired when the item was clicked.
     */
    onclick?: Function;

    tag?: String;

    /**
     * Submenu items.
     */
    items?: ContextMenuItem[]
}

/**
 * Represents a context menu object.
 */
interface ContextMenu {
    new(items: ContextMenuItem[]);

    menuCounter: Number;

    /**
     * Renders the menu at the specified position.
     * @param x The X position.
     * @param y The Y position.
     * @param menu [do not use]
     */
    renderMenu(x: Number, y: Number, menu?: ContextMenuItem[]): HTMLDivElement;
}

/**
 * Represents a MenuBar (a strip with menus containing tasks).
 */
interface MenuBar {
    menuElement: HTMLDivElement;
    _menu: ContextMenu;

    /**
     * Adds a root menu item.
     * @param {String} label The label to use.
     * @param {ContextMenuItem[]} contextMenuItems The menu items to add.
     */
    addRoot(label: String, contextMenuItems: ContextMenuItem[]): HTMLSpanElement

    /**
     * Returns the menu div.
     * 
     * Use this as the element to append your menu to a HTML container.
     */
    getMenuDiv(): HTMLDivElement;
}

/**
 * Represents a UI component.
 */
interface UIComponent {
    /**
     * The underlying element.
     */
    uiComponent: Element;

    /**
     * Optional initialization code.
     */
    init(): void;

    /**
     * Returns the size of the component.
     * @returns {UISize}
     */
    getSize(): {
        w: Number;
        height: Number;
    };

    /**
     * Returns the element for this UI component.
     */
    getElement(): Element;
}

/**
 * A UI component which allows browsing of files.
 */
interface FSViewUIComponent extends UIComponent {
    /**
     * Creates a new file view UI component.
     * @param {String} fsPath The file system path to start at.
     * @param {Boolean} isExplorer An optional parameter specifying if this is being used in an explorer application. It's recommended to leave it alone.
     */
    new(fsPath: String, isExplorer?: Boolean);

    initialNav: Boolean;
    fsPath: String;

    /**
     * Fired when an item is double clicked.
     */
    onitemdblclick(el: HTMLDivElement): void;

    /**
     * Fired when an item is selected.
     */
    onitemselected(el: HTMLDivElement): void;

    /**
     * Fired when a file drag drop operation has succeeded.
     */
    ondropfinish(el: HTMLDivElement): void;

    /**
     * `readdir` override. Override this to modify the file list before its displayed in the file view.
     * @param {String} path The path to read.
     */
    readdirFunc(path: String): String[];

    options: {
        showHiddenFiles: Boolean,
        enableNavigation: Boolean,
        metaLookup: Boolean,
        iconPreviews: Boolean,
        previewMaxSize: Number
    };

    /**
     * Navigates to a path.
     * @param {String} path The path to navigate to.
     * @param {Function} callback The callback to call when navigation has completed.
     * @param {Boolean} quiet Whether to play navigation sounds (optional).
     */
    navigate(path: String, callback: Function, quiet?: Boolean): void;

    /**
     * Creates an icon element.
     * @param {String} label The icon text to use. 
     * @param {String} url The icon image URL to use.
     */
    mkIcon(label: String, url: String): HTMLDivElement;

    /**
     * Deselects all icons.
     */
    deselectAllIcons(): void;

    /**
     * Selects an icon.
     * @param {HTMLDivElement} iconEl The icon to select.
     */
    selectIcon(iconEl: HTMLDivElement): void;

    /**
     * Sorts the icons.
     */
    sortIcons(): void;

    /**
     * Refreshes the view.
     * @param callback The callback to call once refresh is complete.
     */
    refreshView(callback: Function): void;
}

/**
 * An object representing a dialog to allow the user to select (open) a file.
 */
interface OpenFileDialog {
    /**
     * Creates a file open dialog.
     * @param {String} initialDirectory The initial directory to start in.
     * @param {String[]} filter The filter to use.
     * @param callback The callback to call once the dialog completes.
     */
    new(initialDirectory: String, filter: String[], callback: (path: String|null) => void);

    currentPath: String;
    completed: false;
    callback: Function;
    filter: String[];
    dlg: StandardWindow;

    fsv: FSViewUIComponent;

    /**
     * The dialog title.
     */
    title: String;

    /**
     * [internal] Creates the window for this dialog.
     */
    _createWindow(): void;

    /**
     * [internal] Concludes the file selection.
     */
    _conclude(): void;

    /**
     * [internal] Navigates the dialog to the specified path.
     * @param {String} path The path to navigate to.
     */
    _navigate(path: String): void;

    /**
     * Shows the dialog.
     */
    show(): void;
}

/**
 * An object representing a dialog to allow the user to save a file.
 */
interface SaveFileDialog extends OpenFileDialog {
    new(initialDirectory: String, filter: String[], callback:  (path: String|null) => void);
}

/**
 * Represents a dialog button.
 */
interface DialogButton {
    /**
     * The button id.
     */
    id: String;

    /**
     * The button label.
     */
    text: String;

    /**
     * Executed when the button is pressed.
     * 
     * Use `$close` instead of a callback to specify dialog close.
     */
    action: (btn: HTMLButtonElement, dlg: Dialog) => void;
}

/**
 * An object which represents the initialization parameters for a dialog.
 */
interface DialogParams {
    /**
     * The title of the dialog.
     */
    title: String;

    /**
     * The dialog icon.
     */
    icon: String;

    /**
     * The HTML body for the dialog.
     */
    body: String;

    /**
     * The buttons for the dialog to use.
     */
    buttons: DialogButton[];

    /**
     * The dialog sounds.
     */
    sounds: ThemeSound;

    events: {
        /**
         * Executed on dialog close.
         */
        onclose: (dlg: Dialog) => void;

        /**
         * Executed on dialog show.
         */
        onshown: (dlg: Dialog) => void;
    }
}

/**
 * An object which represents a dialog.
 */
interface Dialog {
    /**
     * Creates a new dialog with the specified parameters.
     * @param {DialogParams} props The parameters to use.
     */
    new(props: DialogParams);

    /**
     * The parameters used to initialize the dialog.
     */
    params: DialogParams;

    /**
     * The underlying window object used for the dialog.
     */
    wnd: StandardWindow;

    /**
     * Closes the dialog.
     */
    close(): void;

    /**
     * Shows the dialog.
     */
    show(): void;

    /**
     * Centers the dialog.
     */
    center(): void;

    /**
     * Returns the body.
     * @returns {HTMLElement} The body.
     */
    body(): HTMLElement;
}

/**
 * An object allowing you to build Dialogs.
 * 
 * Dialogs can include message boxes, simple info boxes, etc.
 */
interface DialogCreator {
    /**
     * Shows an alert.
     * @param message The message to show.
     * @param properties (optional) Dialog parameter overrides.
     */
    alert(message: String, properties?: DialogParams): Dialog;

    /**
     * Creates a dialog.
     * @param {DialogParams} props The properties to use.
     */
    create(props: DialogParams): Dialog;

    Dialog: {
        /**
         * Creates a new dialog with the specified parameters.
         * @param {DialogParams} props The parameters to use.
         */
        new(props: DialogParams): Dialog,
        prototype: Dialog
    };
}

/**
 * Represents a UI control with tabbed pages.
 */
interface TabControl extends UIComponent {
    /**
     * Creates a new tab control.
     * 
     * Add pages to it using `addPage()`.
     */
    new();

    /**
     * [internal] Creates an activation zone.
     * @param btn The button to target.
     * @param onclick The action upon click.
     */
    _createActivationZone(btn: HTMLButtonElement, onclick: Function): void;

    /**
     * Opens a page.
     * @param {Number} id The ID of the page to open.
     */
    openPage(id: Number): void;

    /**
     * Adds a tab page.
     * @param title The title of the page to add.
     * @param ondraw Called on draw. Use this to set the contents.
     */
    addPage(title: String, ondraw: (e: HTMLElement) => void): Number;
}

/**
 * Represents a container styled with Windows 96 UI.
 */
interface Panel extends UIComponent {}

/**
 * Represents a container with a scrollable list of items.
 */
interface ListBox extends UIComponent {
    /**
     * Creates a new listbox.
     */
    new();

    /**
     * Called upon item selection.
     */
    onitemselected: (id: String) => void;

    /**
     * Called when the item is no longer selected.
     */
    onitemdeselected: (id: String) => void;

    /**
     * Adds an item to the listbox.
     * @param {String} label The label of the item.
     * @param {String} id The ID of the item.
     * @returns The underlying item element.
     */
    addItem(label: String, id?: String): HTMLDivElement;

    /**
     * Selects an item.
     * @param {String} id The ID of the item to select.
     * @returns Whether the item selection was successful.
     */
    selectItem(id: String): Boolean;

    /**
     * Clears all items.
     */
    clear(): void;

    /**
     * [internal] Deselects all items.
     */
    _deselectAll(): void;
}

/**
 * The parameters used for group box creation.
 */
interface GroupBoxParams {
    /**
     * The group box title.
     */
    title: String;

    /**
     * The HTML body to use.
     */
    body: String;
}

/**
 * Represents a visibly named container with objects.
 */
interface GroupBox extends UIComponent {
    /**
     * Creates a new group box with the specified parameters.
     */
    new(params: GroupBoxParams);

    /**
     * Sets the HTML content of the container.
     * @param html The HTML content to use.
     */
    setBody(html: String): void;

    /**
     * Sets the title of the group box.
     * @param title The title to set.
     */
    setTitle(title: String): void;
}

/**
 * Represents an item (or root item) in a tree view UI component.
 */
interface TreeViewItem {
    /**
     * The item text.
     */
    label?: String;

    /**
     * The icon to use.
     */
    icon?: String;

    /**
     * Specifies whether this item should be opened by default if it were a root.
     */
    opened?: Boolean;

    /**
     * Subitems for item root.
     * 
     * If left empty (by default), this tree item is just an item instead of a root.
     */
    items?: TreeViewItem[];
}

/**
 * Represents a view with grouped items in a tree format.
 */
interface TreeView extends UIComponent {
    new(items: TreeViewItem[]);

    /**
     * [internal] Adds tree view items.
     * @param items The items to add.
     */
    _addItems(items: TreeViewItem[]): void;

    /**
     * Constructs a details element for the specified root item.
     * @param root The root item to create a details element for.
     */
    createDetails(root: TreeViewItem): HTMLDetailsElement;
}

/**
 * Represents a radio item in a radio box.
 */
interface RadioItem {
    /**
     * The item id.
     */
    id: String;

    /**
     * The item label.
     */
    label: String;

    onselect?: (e: {
        /**
         * The item radio input element.
         */
        element: HTMLInputElement,
        /**
         * The item id.
         */
        id: String
    }) => void;

    /**
     * Whether the item should be selected on creation.
     */
    selected?: Boolean;
}

/**
 * Represents a container with radio options.
 */
interface RadioBox extends UIComponent {
    /**
     * Creates a new radio box with the specified items.
     * @param items The items to use.
     */
    new(items: RadioItem[]);

    /**
     * [internal] Adds items to the radio box.
     * @param items The items to add.
     */
    _addItems(items: RadioItem[]): void;
}

/**
 * Represents a Windows 96 application.
 * 
 * This class must be inherited to create an application. It is useless on its own.
 * 
 * This is used for complex applications which use resources.
 * It is the recommended way to write applications.
 */
interface WApplication {
    new();

    /**
     * The app (process) ID.
     * 
     * Incremented when a new instance is created.
     * You can use this ID to kill your process.
     */
    readonly appId: Number;

    /**
     * The main application window.
     */
    readonly appWindow: StandardWindow;

    /**
     * A list containing all window objects owned by this application.
     */
    readonly windows: StandardWindow[];

    /**
     * Called when the application is terminated.
     * 
     * @param result A user defined result.
     */
    onterminated: (result: any) => void;

    /**
     * [internal] Whether the application is still running.
     */
    _running: Boolean;

    /**
     * [internal] Whether the application is in the process of shutting down.
     */
    _terminating: Boolean;

    /**
     * [internal] The exit result.
     */
    _appResult: any;

    /**
     * Sets a value as the app result.
     * @param v The value to use as a result.
     */
    setAppResult(v: any): void;

    /**
     * Terminates the application.
     */
    terminate(): void;

    /**
     * !! Do not override !!
     * Creates a new window for the specified application.
     * 
     * Set `isAppWindow` to false to create a sub window that closes when the main window closes.
     * @param {WindowParams} params The parameters to use to create the window. 
     * @param {Boolean} isAppWindow Specifies whether this is an application window (the main window). Only one such window is allowed to exist.
     */
    createWindow(params: WindowParams, isAppWindow: Boolean): StandardWindow;

    /**
     * The entry point to the application.
     * @param {String[]} argv The arguments to pass to the application.
     */
    main(argv: String[]): Promise<any>;

    /**
     * Called when the application will be terminated.
     */
    ontermination(): void;
}

/**
 * An object representing the current Windows 96 OS release.
 */
interface OSRelease {
    /**
     * Gets the version string.
     */
    getVersionString(): string;

    /**
     * Gets the version number.
     */
    getVersion(): Number;

    /**
     * Gets the release channel of the current build.
     */
    getReleaseChannel(): string;

    /**
     * Gets the build target.
     */
    getType(): "web"|"installer"|"bootable";
}

/**
 * An object representing the current system environment.
 * 
 * Environment variables and such may be defined here.
 */
interface SystemEnvironment {
    /**
     * Sets an environment variable.
     * @param {String} key The key to set.
     * @param {*} value The value to assign.
     */
    setEnv(key: String, value: any): void;

    /**
     * Gets the value of an environment variable key.
     * @param key The key to retrieve the value from.
     */
    getEnv(key: String): void;

    /**
     * Returns the environment keys;
     */
    envKeys: any[];
}

/**
 * Represents OS app metadata.
 */
interface OSAppMeta {
    /**
     * The app icon URL.
     */
    icon: String;

    /**
     * The friendly (display) name of the application.
     */
    friendlyName: String;
}

/**
 * A package manager logger.
 */
interface PkMgrLogger {
    /**
     * Logs some text.
     * @param text The text to log.
     */
    log(text: String): void;
}

/**
 * Represents a sources list object.
 */
interface PkMgrSourcesList {
    /**
     * A list of source URLs.
     */
    sources: String[];

    /**
     * How often the sources should refresh.
     */
    updateFrequency: Number;
}

/**
 * An object representing a package.
 */
interface Package {
    /**
     * The package name (id).
     */
    name: String;

    /**
     * The package display name.
     */
    friendlyName: String;

    /**
     * The package description.
     */
    description: String;

    /**
     * The package author.
     */
    author: String;

    /**
     * The package category.
     */
    category: String;

    /**
     * The package version.
     */
    version: Number;

    /**
     * An array containing what features are required for this application.
     */
    feature_requirements: ["wasm"|"indexeddb"];

    /**
     * Minimum OS version number.
     */
    min_os_version: Number;

    /**
     * Maximum OS version number.
     */
    max_os_version: Number;

    /**
     * Dependent package names.
     */
    depends: [];

    /**
     * Package icon files urls.
     */
    iconFiles: {
        "32x32": String,
        "16x16": String
    }

    /**
     * Package repository URL
     */
    repo: String;

    /**
     * Repository index.
     */
    repoIndex: Number;

    /**
     * The repository ID.
     */
    repoId: String;

    packageRoot: String;

    /**
     * Returns the specific package name.
     */
    getSpecificName(): String;
}

interface PackageRepository {
    /**
     * Repository display name.
     */
    name: String;

    /**
     * Repository maintainers string.
     */
    maintainers: String;

    /**
     * Repository ID.
     */
    id: String;

    /**
     * Repository index.
     */
    index: Number;

    /**
     * Repository URL.
     */
    repo: String;
}

/**
 * An object representing the Windows 96 package manager.
 */
interface PackMan {
    new();

    /**
     * The logger used to log messages.
     */
    logger: PkMgrLogger;

    /**
     * The parsed sources list to be used by the package manager.
     */
    srcConfig: PkMgrSourcesList;

    /**
     * The currently loaded package metadatas.
     */
    packageCache: Package[];

    /**
     * A cache containing all loaded repositories.
     */
    repoCache: PackageRepository[];

    /**
     * Path unpack mappings.
     */
    unpackPathMappings: {
        source: String,
        dest: String
    }[];

    /**
     * Executed on failure.
     */
    onfailure: (e: {
        code: String,
        e: Error
    })=>void;

    /**
     * Checks the filesystem for package manager.
     */
    checkFS(): Promise<void>;

    /**
     * Reads the sources file and returns whether it completed successfully.
     * @returns {Boolean} A value indicating whether the source reading has succeeded.
     */
    readSources(): Promise<boolean>;

    /**
     * Resolves a source from index.
     * @param {Number} index The index to use.
     */
    resolveSourceFromIndex(index: Number): PackageRepository;

    /**
     * Resolves a source index from id.
     * @param {String} id The id.
     */
    getSourceIndexFromId(id: String): Number;

    /**
     * Gets a package by name.
     * @param {String} packageName The package name.
     * @returns {Package} The package.
     */
    getPackage(packageName: String): Package;

    /**
     * Gets the install state for a package.
     * @param {String} packageName The package name of the package to query install state for.
     */
    getPackageInstallState(packageName: String): Promise<"NOT_INSTALLED"|"UPGRADEABLE"|"INSTALLED"|"BROKEN">;

    /**
     * Gets an array of all dependencies to be installed for a certain package name.
     * @returns {Package[]} The packages to install.
     */
    walkDependencies(pkgName: String): Package[];

    /**
     * Reloads the package cache.
     */
    reloadPackageCache(): Promise<void>;

    /**
     * Unpack content zip from package.
     * @param {Uint8Array} binData Zip data.
     * @param {Package} pkg Package.
     * @param onprogress On progress update.
     */
    unpackContentZip(binData: Uint8Array, pkg: Package, onprogress?: (message: String, type: String)=>void): Promise<void>;

    /**
     * Removes a package.
     * @param {Package} pkg The package to remove.
     * @param onprogress On progress event.
     */
    removePackage(pkg: Package, onprogress?: (message: String, type: String)=>void): Promise<void>;

    /**
     * Installs a package.
     * @param {Package} pkg The package to install.
     * @param {Function} onprogress On progress event.
     */
    installPackage(pkg: Package, onprogress?: (message: String, type: String)=>void): Promise<void>;

    /**
     * Gets all packages by category.
     * @param {String} cat The category to filter with.
     * @returns {Package[]} The results.
     */
    getPackagesByCategory(cat: String): Package[];

    /**
     * [internal] Performs Package Manager checks.
     */
    performChecks(): Promise<void>;
}

/**
 * Shell file manipulation queue.
 */
interface ShellFileQueue {
    queue: {
        /**
         * Returns the file queue.
         */
        get(): String[],

        /**
         * Clears the shell file queue.
         */
        clearQueue(): void;
    }

    /**
     * Enqueues an item.
     * @param {String} item The item to enqueue.
     */
    enqueue(item: String): void;

    /**
     * Enqueues files in the shell file queue.
     * @param {String[]} items The items to enqueue.
     */
    enqueueMany(items: String[]): void;

    /**
     * Sets the target file manipulation operation for the queue.
     * @param {"copy"|"move"} name The name of the operation to use.
     */
    setOperation(name: String): void;

    /**
     * Removes broken/nonexistent paths in the queue.
     */
    sanitize(): void;

    /**
     * Resets the shell file handler.
     */
    reset(): void;
}

/**
 * An object representing a notification icon in the taskbar.
 */
interface NotifyIcon {
    /**
     * Creates a new notification icon.
     * @param id The icon ID.
     * @param iconUrl The icon URL.
     */
    new(id: String, iconUrl: String);

    /**
     * Fired on item click.
     */
    onclick: ()=>void;

    /**
     * Fired on item double click.
     */
    ondblclick: ()=>void;

    /**
     * The underlying HTML element for this icon.
     */
    notifyElement: HTMLDivElement;

    /**
     * Sets the icon url.
     */
    setIcon(iconUrl: String): void;

    /**
     * Sets the icon ID.
     * @param id The ID to set.
     */
    setId(id: String): void;

    /**
     * Destroys the notification icon.
     */
    destroy(): void;
}

/**
 * The shell taskbar.
 */
interface ShellTaskbar {
    /**
     * Assigns an element the taskbar role.
     * @param {HTMLDivElement} el The element to use as the taskbar.
     **/
    assign(el: HTMLElement): void;

    /**
     * Creates an appbar for the specified window.
     * @param {StandardWindow} wnd The window to create an appbar for.
     */
    createWindowAppBar(wnd: StandardWindow): void;

    /**
     * Activates an appbar for the specified window.
     * @param {String} winId The window id to activate the app bar for.
     * @param {Boolean} click Whether to trigger the click event.
     */
    activateAppBar(winId: String, click?: Boolean): void;

    /**
     * Deactivates an appbar for the specified window.
     * @param {String} winId The window id to use.
     */
    deactivateAppBar(winId: String): void;

    /**
     * Destroys an appbar.
     * @param {String} winId The window id to use.
     */
    destroyAppBar(winId: String): void;

    /**
     * Registers a notification icon in the notification area of the taskbar.
     * @param {NotifyIcon} iconObject The icon object to register.
     */
    registerNotifyIcon(iconObject: NotifyIcon): void;

    /**
     * Sets the visibility of the taskbar.
     * @param {Boolean} visible Whether to show it or not (default = true).
     */
    setVisibility(visible?: Boolean): void;
}

/**
 * An object representing the desktop shell.
 */
interface DesktopShell {
    /**
     * [internal - undocumented]
     */
    initialize(): Promise<void>;

    /**
     * Toggles the start menu.
     * @param forceClose Whether to force close the start menu.
     */
    toggleStartMenu(forceClose: Boolean): Boolean;

    /**
     * Updates the desktop with icons contained in c:/user/desktop
     */
    updateDesktop(): Promise<void>;

    /**
     * Shows a run box.
     */
    runBox(): Promise<void>;
}

/**
 * An object representing WRT initialization parameters.
 */
interface WRTParameters {
    /**
     * The current working directory.
     */
    cwd: String;

    /**
     * A string specifying from where the script was ran.
     */
    scriptDir: String;

    /**
     * Specifies the path of the module.
     */
    modulePath: String;

    /**
     * Defines the execution environment.
     */
    envType: "normal"|"console"|"kernel"|"other";

    /**
     * A user defined environment object.
     */
    boxedEnv: Object;
}

/**
 * An object representing WRT module info.
 */
interface WRTModuleInfo {
    /**
     * Library path.
     */
    libPath: String;

    /**
     * The name of the module.
     */
    moduleName: String;

    /**
     * Version string.
     */
    version: String;
}

/**
 * Root Windows 96 API namespace.
 */
export declare namespace w96 {
    /**
     * The Windows 96 file system API.
     */
    const FS: FS;

    /**
     * File system utilities.
     */
    const FSUtil: FSUtil;

    /**
     * The Windows 96 window system object.
     */
    const WindowSystem: WindowSystem;

    /**
     * Represents the window creation parameters during initial window loading.
     */
    const WindowParams: {
        new(): WindowParams,
        prototype: WindowParams
    };

    /**
     * Represents a window in the OS.
     */
    const StandardWindow: {
        /**
         * Creates a new window with the specified parameters.
         * @param {WindowParams} params The window parameters to use.
         */
        new(params: WindowParams): StandardWindow,
        prototype: StandardWindow
    };

    /**
     * Windows 96 kernel entry point.
     */
    function main(): Promise<void>;

    /**
     * File system driver namespace.
     */
    const fstype: {
        /**
         * Indexed File System driver.
         * 
         * Can be inherited for custom implementations.
         * Used by Windows 96 to map as `c:/`
         */
        IndexedFileSystem: {
            new(prefix: String): IndexedFileSystem,
            prototype: IndexedFileSystem
        },

        /**
         * Ramdrive file system driver.
         */
        RamFileSystem: {
            new(prefix: String): RamFileSystem,
            prototype: RamFileSystem
        },

        /**
         * Local storage file system driver.
         */
        LocalStorageFileSystem: {
            new(prefix: String): LocalStorageFileSystem,
            prototype: LocalStorageFileSystem
        },

        /**
         * Base file system interface.
         */
        FileSystemBase: {
            new(prefix: String): IFileSystem,
            prototype: IFileSystem
        },

        /**
         * Read only (remote) file system driver.
         * 
         * Used by W:/ (the true system drive).
         */
        RemoteReadOnlyFileSystem: {
            new(prefix: String, schemaPath: String): RemoteReadOnlyFileSystem,
            prototype: RemoteReadOnlyFileSystem
        }
    }

    /**
     * UI namespace.
     */
    namespace ui {
        /**
         * Window system window compositor object.
         * 
         * Allows for compositing of windows before they are shown to the user.
         */
        const comp: WinCompositor;

        /**
         * Simple message box UI object.
         */
        const MsgBoxSimple: MsgBoxSimple;

        /**
         * Represents the current desktop theme.
         */
        const Theme: Theme;

        /**
         * Represents a context menu object.
         */
        const ContextMenu: {
            new(items: ContextMenuItem[]): ContextMenu,
            prototype: ContextMenu
        };

        /**
         * Represents a MenuBar (a strip with menus containing tasks).
         */
        const MenuBar: {
            new(): MenuBar,
            prototype: MenuBar
        };

        /**
         * An object representing a dialog to allow the user to select (open) a file.
         */
        const OpenFileDialog: {
            /**
             * Creates a file open dialog.
             * @param {String} initialDirectory The initial directory to start in.
             * @param {String[]} filter The filter to use.
             * @param callback The callback to call once the dialog completes. The path will be null if nothing was selected.
             */
            new(initialDirectory: String, filter: String[], callback: (path: String|null) => void): OpenFileDialog,
            prototype: OpenFileDialog
        };

        /**
         * An object representing a dialog to allow the user to save a file.
         */
        const SaveFileDialog: {
            /**
             * Creates a file saving dialog.
             * @param {String} initialDirectory The initial directory to start in.
             * @param {String[]} filter The filter to use.
             * @param callback The callback to call once the dialog completes. Path will be null when nothing was specified.
             */
            new(initialDirectory: String, filter: String[], callback: (path: String|null) => void): SaveFileDialog,
            prototype: SaveFileDialog
        };

        /**
         * An object allowing you to build Dialogs within Windows 96.
         * 
         * Dialogs can include message boxes, simple info boxes, etc.
         */
        const DialogCreator: DialogCreator;

        /**
         * Animates an element.
         * @param element The element to animate. This can be a selector or DOM reference.
         * @param animationName The class name of the element to animate.
         * @param callback The callback to use when the animation completes. This is optional and not required.
         */
        function animateElement(element: Element | String, animationName: String, callback?: ()=>void): void;

        /**
         * UI components namespace.
         * 
         * You can instantiate these and add them to an application.
         */
        namespace components {
            /**
             * Represents a UI control with tabbed pages.
             */
            const TabControl: {
                /**
                 * Creates a new tab control.
                 * 
                 * Add pages to it using `addPage()`.
                 */
                new(): TabControl,
                prototype: TabControl
            };

            /**
             * Represents a container styled with Windows 96 UI.
             */
            const Panel: {
                /**
                 * Creates a new panel.
                 */
                new(): Panel,
                prototype: Panel
            };

            /**
             * Represents a container with a scrollable list of items.
             */
            const ListBox: {
                /**
                 * Creates a new listbox.
                 */
                new(): ListBox,
                prototype: ListBox
            };

            /**
             * Represents a visibly named container with objects.
             */
            const GroupBox: {
                /**
                 * Creates a new group box with the specified parameters.
                 */
                new(params: GroupBoxParams): GroupBox,
                prototype: GroupBox
            };

            /**
             * Represents a view with grouped items in a tree format.
             */
            const TreeView: {
                /**
                 * Creates a tree view with the specified items.
                 * @param items The items to use.
                 */
                new(items: TreeViewItem[]): TreeView,
                prototype: TreeView
            };

            /**
             * Represents a container with radio options.
             */
            const RadioBox: {
                /**
                 * Creates a new radio box with the specified items.
                 * @param items The items to use.
                 */
                new(items: RadioItem[]): RadioBox,
                prototype: RadioBox
            };

            /**
             * UI utilities.
             */
            namespace util {
                /**
                 * [undocumented]
                 */
                function cfxRound(u: Number, i: Number, p: Number): Number;
            }
        }
    }

    /**
     * Represents a Windows 96 application.
     * 
     * This class must be inherited to create an application. It is useless on its own.
     * 
     * This is used for complex applications which use resources.
     * It is the recommended way to write applications.
     */
    const WApplication: {
        new(): WApplication,
        prototype: WApplication

        /**
         * Kills an application.
         * @param app_id The ID of the app to kill.
         * @param force Whether to use force.
         */
        kill(app_id: Number, force: Boolean): void;

        /**
         * Executes an application and awaits it.
         * @param instance The instance to execute.
         * @param args The arguments to pass.
         * @returns A user defined result, returned from `main()`.
         */
        execAsync(instance: WApplication, args: String[]): Promise<any>;
    }

    /**
     * Debug export namespace.
     * 
     * This is purely for the Windows 96 developers, there is no need to mess with it.
     */
    namespace __debug {
        /**
         * Dummy object.
         */
        const __empty: null;
    }

    /**
     * System administration namespace.
     */
    namespace sys {
        /**
         * Opens a file.
         * @param path The path of the file to open.
         * @returns A result from whatever application executed the file.
         */
        function execFile(path: String): Promise<any>;

        /**
         * Executes a command.
         * @param {String} cmd The command to execute.
         * @param {String[]} argv The arguments to pass.
         */
        function execCmd(cmd: String, argv: String[]): Promise<any>;

        /**
         * An object representing the current Windows 96 OS release.
         */
        const OSRelease: OSRelease;

        /**
         * An object representing the current system environment.
         * 
         * Environment variables and such may be defined here.
         */
        const env: SystemEnvironment;

        /**
         * "Reboots" the system.
         * 
         * This is a physical reboot on different builds.
         */
        function reboot(): void;

        /**
         * System registry namespace.
         * 
         * Its main purpose is to administer the registration of apps.
         */
        namespace reg {
            /**
             * Register an application.
             * @param {String} appName The name of the app.
             * @param {String[]} fileTypes The file types to be opened by this app.
             * @param main Entry point callback.
             * @param {OSAppMeta} meta App metadata. This is optional.
             */
            function registerApp(appName: String, fileTypes: String[], main: (args: String[])=>Promise<any>, meta?: OSAppMeta): void;

            /**
             * Check if an application exists.
             * @param {String} name The name of the application.
             */
            function appExists(name: String): Boolean;

            /**
             * Returns an array of installed app names.
             * @returns {String[]} The array of installed app names.
             */
            function getInstalledApps(): String[];

            /**
             * Deregisters an app.
             * @param {String} name The name of the app.
             */
            function deregisterApp(name: String): void;

            /**
             * Execute a named application.
             * 
             * It is recommended to use `w96.sys.execCmd` instead since that also takes other types of apps into account.
             * @param {String} appName The name of the app to execute.
             * @param {String[]} args Command line arguments.
             */
            function executeApp(appName: String, args: String[]): Promise<any>;

            /**
             * Returns all applications which handle a particular file type.
             * @param {String} path The path of the file to handle.
             */
            function getFileHandlers(path: String): String[];
        }

        /**
         * Data loading namespace.
         */
        namespace loader {
            /**
             * Loads a text file from URL.
             * @param {String} url The URL of the text file to load.
             * @param {Boolean} cache Whether to cache this file. It is optional and set to `true` by default.
             */
            function loadTextAsync(url: String, cache?: Boolean): Promise<String>;

            /**
             * Loads a JavaScript library.
             * @param {String} url The URL of the library to load.
             */
            function loadlibAsync(url: String): Promise<void>;

            /**
             * Loads a CSS file into the current session.
             * @param {String} url The URL of the CSS file to load.
             */
            function loadStyleAsync(url: String): Promise<void>;

            /**
             * Creates a style element of a local CSS file.
             * @param {String} path The path of the CSS file to load.
             */
            function createStyleFromPath(path: String): Promise<HTMLStyleElement>;
        }

        /**
         * Renders a BSOD (blue screen of death).
         * @param {String} message The message to render. 
         */
        function renderBSOD(message: String): Promise<void>;

        /**
         * WASM (WebAssembly) namespace.
         */
        namespace wasm {
            /**
             * Loads a wasm file locally.
             * @param {String} path The path of the WebAssembly file to load.
             * @param {Boolean} exposeStandardImports Whether to expose standard Windows 96 API imports for WASM. This is optional and set to `true` by default.
             */
            function loadLocal(path: String, exposeStandardImports?: Boolean): Promise<WebAssembly.WebAssemblyInstantiatedSource>;

            /**
             * Executes a WASM binary.
             * @param {String} path The path of the WebAssembly file to load.
             * @param {Boolean} suppressErrors Whether to suppress errors. This is optional and set to `false` by default.
             */
            function execPrgm(path: String, suppressErrors?: Boolean): Promise<WebAssembly.ExportValue>;

            /**
             * WASM utility namespace.
             */
            namespace util {
                /**
                 * Converts a string constant to wasm.
                 * @param {String} str The string to convert.
                 * @param {Boolean} stripComments Whether to strip comments. This is optional and set to `false` by default.
                 */
                function strconst2wat(str: String, stripComments?: Boolean): String;
            }
        }

        /**
         * Sets the kernel image.
         * @param {String} path The path of the kernel image to use.
         */
        function setKernImage(path: String): Promise<void>;

        /**
         * Code to check if current Windows 96 version is old.
         * @returns {Boolean} Whether the version is old.
         */
        function updateNeeded(): Boolean;

        /**
         * A class to read directory metadata.
         */
        class DirMetadataReader {
            /**
             * Constructs a dir metadata reader.
             * @param dirPath The directory path to read.
             */
            constructor(dirPath: String);

            /**
             * Metadata file path.
             */
            metaPath: String;

            /**
             * Properties retrieved from meta file.
             */
            properties: {
                background: String;
                icon: String;
                description: String;
                displayName: String;
                generateThumbnails: Boolean;
            }
        }

        /**
         * An object representing the Windows 96 package manager.
         */
        const PkMgr: {
            new(): PackMan,
            prototype: PackMan
        }

        /**
         * Backup manager namespace
         */
        namespace BackupManager {
            /**
             * Creates a backup and returns the `JSZip` instance.
             */
            function makeBackup(): Promise<any>;
        }
    }

    /**
     * Shell namespace.
     */
    namespace shell {
        /**
         * Creates a shortcut.
         * @param {String} path The path to create the shortcut at.
         * @param {String} icon The icon name to use for the shortcut (URLs may also be supplied).
         * @param {String} action The command to execute.
         * @param {Boolean} showShortcutEmblem Whether to hide the shortcut emblem (default = false).
         */
        function mkShortcut(path: String, icon: String, action: String, hideShortcutEmblem?: Boolean): Promise<void>;

        /**
         * Shell file manipulation queue.
         */
        const fileQueue: ShellFileQueue;

        /**
         * The shell taskbar.
         */
        const Taskbar: ShellTaskbar;

        /**
         * An object representing a notification icon in the taskbar.
         */
        const NotifyIcon: {
            /**
             * Creates a new notification icon.
             * @param id The icon ID.
             * @param iconUrl The icon URL.
             */
            new(id: String, iconUrl: String): NotifyIcon,
            prototype: NotifyIcon
        }

        /**
         * The current desktop shell.
         */
        const desktop: DesktopShell;
    }

    /**
     * Utility namespace.
     */
    namespace util {
        /**
         * Sideloads a zip to the system drive.
         * @param {String} url The URL of the ZIP to sideload.
         */
        function sideloadZip(url: String): Promise<void>;

        /**
         * Converts a blob to data URI.
         * @param {Blob} blob The blob to convert.
         */
        function blobToDataURI(blob: Blob): Promise<string>;

        /**
         * Converts a data URI to Blob.
         * @param {String} dataURI The data URI to convert.
         */
        function dataURItoBlob(dataURI: String): Promise<Blob>;

        /**
         * Generates a random number between `min` and `max`.
         * @param {Number} min The minimum value.
         * @param {Number} max The maximum value.
         */
        function rand(min: Number, max: Number): Number;

        /**
         * Promisified `setTimeout()`.
         * @param {Number} ms The number of seconds to timeout for.
         */
        function wait(ms: Number): Promise<void>;
    }

    /**
     * Network services namespace.
     */
    namespace net {
        /**
         * Cross origin Iframe services.
         */
        namespace crossifr {
            /**
             * Register the `postMessage()` handler.
             */
            function register(): void;

            /**
             * Registers basic events.
             */
            function registerBasicEvents(): void;

            /**
             * Trusts a URL.
             * @param {String} url The URL to trust.
             */
            function trust(url: String): void;

            const events: EventEmitter;
        }
    }

    /**
     * [undocumented]
     */
    namespace __sys {}

    /**
     * System events namespace.
     */
    namespace evt {
        /**
         * File system events.
         */
        const fs: EventEmitter;

        /**
         * General system events.
         */
        const sys: EventEmitter;

        /**
         * Window manager events.
         */
        const wm: EventEmitter;

        /**
         * UI events.
         */
        const ui: EventEmitter;
    }

    /**
     * WRT namespace.
     */
    namespace WRT {
        /**
         * Runs some code under WRT.
         * @param code The code to run.
         * @param params The WRT initialization parameters to pass.
         */
        function run(code: String, params: WRTParameters): Promise<any>;

        /**
         * Runs a file under WRT.
         * @param path The path of the file to run.
         * @param params The WRT initialization parameters to pass.
         */
        function runFile(path: String, params: WRTParameters): Promise<any>;

        /**
         * Resolves WRT module info for the specified module name.
         * @param name The name of the module to resolve.
         */
        function resolveModule(name: String): Promise<WRTModuleInfo>;
    }
}

declare const EventEmitter: EventEmitter;