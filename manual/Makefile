output-dir := ../man
marked-man := ../node_modules/.bin/marked-man
mds := $(notdir $(wildcard *.md))
man-files := $(addprefix $(output-dir)/, $(basename $(mds)))

all: manpage

manpage: $(man-files)

$(output-dir)/%.1: %.1.md | $(marked-man) $(output-dir)
	npx marked-man --breaks --section 1 --manual 'General Commands Manual' $*.1.md > $@

$(output-dir)/%.5: %.5.md | $(marked-man) $(output-dir)
	npx marked-man --breaks --section 5 --manual 'File Formats Manual' $*.5.md > $@

$(marked-man):
	npm install

$(output-dir):
	mkdir -p $(output-dir)

.PHONY: clean
clean:
	$(RM) -r $(output-dir)
