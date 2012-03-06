GREP = /usr/bin/grep
CUT = /usr/bin/cut
SHELL = /bin/sh
CHMOD = chmod
CP = cp
MV = mv
NOOP = $(SHELL) -c true
RM_F = rm -f
RM_RF = rm -rf
TEST_F = test -f
TOUCH = touch
UMASK_NULL = umask 0
DEV_NULL = > /dev/null 2>&1
MKPATH = mkdir -p
CAT = cat
MAKE = make
OPEN = open
ECHO = echo
ECHO_N = echo -n
JAVA = java
PGVERSION = 1.5.0

all :: js copy_js sample_app

clean :: clean_libs clean_sample_app

clean_libs:
	$(RM_RF) lib

clean_sample_app:
	$(RM_F) framework/phonegap-$(PGVERSION).js
	$(RM_F) framework/sample.wgt

copy_js: js
	$(CP) lib/phonegap.js framework/phonegap-$(PGVERSION).js

js: lib/phonegap.js

lib/phonegap.js: js/phonegap-core.js js/device.js js/file.js
	$(MKPATH) lib
	$(RM_F) $@
	$(CAT) js/phonegap-core.js >> $@
	$(CAT) js/device.js >> $@
	$(CAT) js/file.js >> $@

sample_app: copy_js
	cd framework && zip -r sample.wgt * && cd ..
