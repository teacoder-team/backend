export default {
	'pre-commit': 'yarn lint-staged',
	'commit-msg': 'yarn commitlint --edit ${1}'
}
