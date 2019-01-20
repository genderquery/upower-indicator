EXTENSION_NAME=upower-indicator@genderquery.gitlab.com
INSTALL_PATH=${HOME}/.local/share/gnome-shell/extensions

.PHONY: all build install uninstall enable disable reload clean docs

all: build docs

build:
	mkdir --parents build
	cp --recursive --preserve=timestamps metadata.json src/*.js build

install: build uninstall
	mkdir --parents "${INSTALL_PATH}/${EXTENSION_NAME}"
	cp --recursive --preserve=timestamps build/* "${INSTALL_PATH}/${EXTENSION_NAME}"

uninstall: disable
	-rm --recursive --force "${INSTALL_PATH}/${EXTENSION_NAME}"

enable: install
	gnome-shell-extension-tool --enable-extension=${EXTENSION_NAME}

disable:
	-gnome-shell-extension-tool --disable-extension=${EXTENSION_NAME}

reload:
	gdbus call --session --dest org.gnome.Shell --object-path /org/gnome/Shell \
		--method org.gnome.Shell.Extensions.ReloadExtension ${EXTENSION_NAME}

clean:
	rm --recursive --force build docs node_modules

docs:
	jsdoc -c jsdoc.json