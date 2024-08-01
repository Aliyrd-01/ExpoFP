# Testing

Our high-load plans (approximately 2000 exhibitors and booths) have issues with performance on iPhones. The application may crash when zooming in/out or when plotting routes. This happens due to the large amount of text being rendered on the booths. (Code logic located in `/src/components/Map/drawing/config/config-booth-labels.ts`)

To address this, the admin panel has been updated to allow optimization level configuration of the plan. This setting reduces the font size in the booths, which decreases memory usage on the device.
![Optimization settings](https://img001.prntscr.com/file/img001/ee9AyUeeQvSIcR4aZ9747g.png)

You can test the plan on the platform [BrowserStack](https://www.browserstack.com/) on an iPhone with iOS version > 14.

Using URL parameters (`?copy_exh=<number>`), you can duplicate the number of exhibitors in the booths or artificially add them if they are not present for testing plan limits. Example:[https://demo.expofp.com/?copy_exh=2](https://demo.expofp.com/?copy_exh=2)

Developers can view all textures with their sizes that are rendered on the plan. To do this, in the local version of the plan, type `q1` in the search menu.

![Search Menu](https://img001.prntscr.com/file/img001/jl4epDSKR2GiAlBK0bIjMw.png)


This will open a window with all the textures and their information, including the Total square. Typically, if a plan has a Total square greater than 38,000,000, this can indicate potential crashes on iPhone devices.
![Total Square](https://img001.prntscr.com/file/img001/cZighgsRQRO81BLne2DPLg.png)
