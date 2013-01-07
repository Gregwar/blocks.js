DIRECTORY := ../lib/

TARGET := blocks.js

SOURCES := jquery.json.js jquery.mousewheel.js jquery.formserialize.js \
    utils.js parameterfield.js parametersmanager.js segment.js \
    edge.js blocksmessages.js blocksmenu.js blocktype.js \
    block.js blocks.js

all: $(SOURCES) $(DIRECTORY)
	cat $(SOURCES) > "$(DIRECTORY)$(TARGET)"
	cp blocks.css "$(DIRECTORY)"

$(DIRECTORY):
	mkdir $(DIRECTORY)
	
clean:
	rm $(DIRECTORY)/*
