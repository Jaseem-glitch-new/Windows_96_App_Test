const { register } = w96.app;
const { Theme } = w96.ui;

class TestApplication extends WApplication {
    constructor() {
        super();
    }
    
    async main(argv) {
        super.main(argv);
        
        const mainwnd = this.createWindow({
            title: "My Application",
            icon: Theme.getIconUrl("exec", "small"),
            initialHeight: 400,
            initialWidth: 640,
            body: "very cool text",
            bodyClass: "very-cool-app",
            center: true,
            taskbar: true
        }, true); // true specifies that this is an app window (main window)
        
        mainwnd.show();
    }
}

register({
    command: "test-app",
    type: "gui",
    cls: TestApplication,
    meta: {
        icon: Theme.getIconUrl("exec"),
        friendlyName: "Test Application"
    }
});
