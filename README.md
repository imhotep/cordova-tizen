# Cordova Tizen

Cordova Tizen is a skeleton web application which allows a developer to build and run a Cordova web application on Tizen.  
Cordova port to tizen is done thanks to a simple JS wrapper (shim layer) doing the mapping of the Cordova Web API to the Tizen Web API.

## Set up your environment

---

Open a terminal, and navigate to the root cordova-tizen folder.
A Makefile resides here; You can run make on individual target tasks:

   - `make js` - builds phonegap.js from source javascript files to libs/phonegap.js
   - `make copy_js` - copies libs/phonegap.js to framework/phonegap-$(PGVERSION).js (e.g: phonegap-1.4.1.js).
   Modify this path if you want it in another location.
   - `make sample_app` - package the skeleton web application as a "wgt" widget package which can be imported from 
   Tizen SDK IDE. (File->Import->Widget [Project and Widget File] -> select widget)


## Implementation Status

---

The current implementation is based on Tizen SDK Beta release: see http://developer.tizen.org/documentation

### Ready
- **Device:** wrapper on Tizen System Information Web API. 
- **File:** wrapper on W3C File API (FileTransfer missing).  
- **Storage:** W3C Web SQL Database and W3C Web Storage. 
- **Geolocation:** W3C Geolocation API. 
- **URI schemes:** (tel:, sms:, mmsto:, mailto:) supported by WRT. 

### ToDo
- **Contacts:** wrapper on Tizen Contact Web API. 
- **Events:** online/offline: wrapper Browser Online state. 
- **Accelerometer:** wrapper on W3C sensor API or W3C Device Orientation Events API. 
- **Compass:** wrapper on W3C sensor API or W3C Device Orientation Events API. 

### ToDo when APIs supported by Tizen SDK
- **Connection:** W3C Network Information. 
- **Notification:** W3C Web Notification/W3C vibration API. 
- **Camera:** Tizen Application Web API or W3C HTML Media Capture. 
- **Capture:** Tizen Application Web API or W3C HTML Media Capture, GetUserMedia API. 
- **Events:** battery: wrapper on W3C battery API. 
- **Media:** Tizen Application Web API or HTML5 Audio. 

