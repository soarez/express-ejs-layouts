REPORTER = spec


test: 
	./node_modules/.bin/mocha --reporter $(REPORTER)

.PHONY: test

watch: 
	./node_modules/.bin/mocha --reporter min -w