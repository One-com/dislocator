default:
	npm install

release-%:
	npm run lint
	npm run test-nowatch
	npm run build
	npm version $*
