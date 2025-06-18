namespace MobControlPC;

public partial class App : Application
{
	public App()
	{
		InitializeComponent();

		MainPage = new MainPage();
	}

    // --- ADD THIS METHOD ---
    // This method is called when the application creates its main window.
    protected override Window CreateWindow(IActivationState? activationState)
    {
        var window = base.CreateWindow(activationState);

        // Set the initial size of the window to something more appropriate.
        window.Width = 1100;
        window.Height = 720;
        
        return window;
    }
}
