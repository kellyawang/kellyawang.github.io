SETUP.md
# Bits of Food

### Instructions for running a local node server to host this project.
**Prerequisites**
* have node installed
* have the [bitsoffood repo](https://github.com/jessupjs/bits-of-food) checked out locally

**Install Steps:**

1. Install dependencies for 'server' directory (express)
    + $ `npx generator server`
    + $ `cd client`
    + $ `npm install`
    + $ `npm install -g nodemon`
2. Running on Port 3663 (bin/www)
    + Dev-mode: `npm run start-dev`
    + Dev-mode (debug): `npm run start-ins`
3. Install CSV Parse: `npm install csv`
