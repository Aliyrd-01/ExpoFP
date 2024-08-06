## Runtime for [ExpoFP.com](https://expofp.com/) floorplans

Run development version floorplan
```
yarn dev expo=<floorplane_name>
```

To run Storybook:

```sh
yarn storybook
```

For information on testing high-load floorplans, please read the details in the [Testing](./TESTING.md) file.

## Deploy
Sometimes you need to do some custom stuff for a particular plan without affecting the rest of the plan. To do this, go to the repository https://github.com/expofp/efp-app-deploy and in the `custom` object (https://github.com/expofp/efp-app-deploy/blob/master/deploy.js#L14) add a pair `[key]: [value]`, where key is the name of the plan and value is the name of the git branch in the `efp-app` repository. After that, run the `/deploy` command in slack in any channel. This will start the deploy process https://github.com/expofp/efp-app-deploy/actions.
> For example, we can use [demo-staging.expofp.com](https://demo-staging.expofp.com/) for testing purposes.

## Custom CSS

### Introduction
On the page https://app.expofp.com/expo/<EXPO_ID>/settings/floor-plan, you can add custom CSS via the "Add Custom CSS" button to customize the interface. This allows for font changes and other styling adjustments.

### Example
Here's an example of how to import fonts and apply a custom font to the entire interface:

```
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Sankofa+Display&family=Space+Grotesk:wght@300..700&display=swap');

:root {
    --expofp-font-face: "Roboto";
}
```

This CSS snippet changes the font across the entire interface, including text within booths.

### Additional CSS Variables

You can also set other CSS variables to change the font weight for specific elements within the booth:

```
:root {
    --expofp-booth-main-weight: 700;          /* For booth name */
    --expofp-booth-details-weight: 700;       /* For booth details (size, reserve) */
    --expofp-exhibitor-main-weight: 700;      /* For all exhibitor names */
    --expofp-exhibitor-details-weight: 700;   /* For exhibitor details (booth number) */
    --expofp-booth-special-weight: 700;       /* For special booths */
}
```

Descriptions of Variables:
* `--expofp-booth-main-weight`: Sets the font weight for the booth name.
* `--expofp-booth-details-weight`: Sets the font weight for booth details, such as size and reservation status.
* `--expofp-exhibitor-main-weight`: Sets the font weight for all exhibitor names.
* `--expofp-exhibitor-details-weight`: Sets the font weight for exhibitor details, including booth number.
* `--expofp-booth-special-weight`: Sets the font weight for special booths.
