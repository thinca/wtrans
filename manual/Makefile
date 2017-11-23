output-dir := ../man
vendor := vendor
mds := $(notdir $(wildcard *.md))
man-files := $(addprefix $(output-dir)/, $(basename $(mds)))

all: manpage

manpage: $(man-files)

$(output-dir)/%: %.md | $(vendor) $(output-dir)
	bundle exec md2man-roff $*.md > $@

$(vendor):
	bundle install --path $(vendor)/bundle

$(output-dir):
	mkdir -p $(output-dir)

.PHONY: clean
clean:
	$(RM) -r $(output-dir)
