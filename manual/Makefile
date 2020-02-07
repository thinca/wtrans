output-dir := ../man
bundle-dir := .bundle
mds := $(notdir $(wildcard *.md))
man-files := $(addprefix $(output-dir)/, $(basename $(mds)))

all: manpage

manpage: $(man-files)

$(output-dir)/%: %.md | $(bundle-dir) $(output-dir)
	bundle exec md2man-roff $*.md > $@

$(bundle-dir):
	bundle install

$(output-dir):
	mkdir -p $(output-dir)

.PHONY: clean
clean:
	$(RM) -r $(output-dir)
