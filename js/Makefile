DIRECTORY := ../lib/

TARGET := blocks.js
TEMP := blocks.all.js

SOURCES := jquery.json.js jquery.mousewheel.js jquery.formserialize.js jquery.svg.min.js \
    utils.js field.js fields.js segment.js types.js connector.js \
    edge.js blocksmessages.js blocksmenu.js meta.js history.js \
    block.js blocks.js

all: $(SOURCES) $(DIRECTORY)
	cat $(SOURCES) > "$(DIRECTORY)$(TEMP)"
	uglifyjs "$(DIRECTORY)$(TEMP)" > "$(DIRECTORY)$(TARGET)"
	cp blocks.css "$(DIRECTORY)"
	cp -R gfx "$(DIRECTORY)"

$(DIRECTORY):
	mkdir $(DIRECTORY)
	
clean:
	rm $(DIRECTORY)/*
