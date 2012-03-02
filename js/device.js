/*
 * Device
 */

/*
 * this represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
function Device() {

	this.version = null;
	this.uuid = null;
	this.name = null;
	
	/* PhoneGap version */
	this.phonegap = "1.4.1";
	
	/* Device OS name */
	this.platform = "Tizen Beta";
	
	var that = this;
	
	tizen.systeminfo.getPropertyValue("Device",
		function onSuccessCallback(sysInfoProp) {
				/* Device Model */
				that.name = sysInfoProp.model;
				/* Device UUID */
				that.uuid = sysInfoProp.imei;
				/* Device OS version */
				that.version = sysInfoProp.version;
				
				console.log("model: " + that.name);
				console.log("uuid: " + that.uuid);
				console.log("version: " + that.version);
				console.log("platform: " + that.platform);
				console.log("phonegap version: " + that.phonegap);
				
				window.setTimeout(
						function () {
							var e = document.createEvent('Events');
							e.initEvent('deviceready');
							console.log("Sending deviceready...");
							document.dispatchEvent(e);
						},
						10
					);
			},
		function onErrorCallback (error) {
				alert("An error occurred " + error.message);
			}
	);
};

/*
 * Create the global Device object
 */
if (typeof window.device == 'undefined') window.device = navigator.device = new Device();
