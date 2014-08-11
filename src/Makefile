DIRECTORY := ../build/

TARGET := blocks.min.js
TEMP := blocks.js

SOURCES :=  utils.js field.js fields.js segment.js types.js connector.js \
    edge.js blocksmessages.js blocksmenu.js meta.js history.js \
    block.js blocks.js

all: $(SOURCES) $(DIRECTORY)
	cat $(SOURCES) > "$(DIRECTORY)$(TEMP)"
	uglifyjs "$(DIRECTORY)$(TEMP)" > "$(DIRECTORY)$(TARGET)"
	cp blocks.css "$(DIRECTORY)"
	cp -R gfx "$(DIRECTORY)"
	cp -R vendor/fancybox "$(DIRECTORY)"
	cp vendor/*.js "$(DIRECTORY)"

$(DIRECTORY):
	mkdir $(DIRECTORY)
	
clean:
	rm $(DIRECTORY)/*
