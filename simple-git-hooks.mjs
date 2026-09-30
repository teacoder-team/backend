export default {
	'pre-commit': 'bunx lint-staged',
	'commit-msg': 'bunx commitlint --edit ${1}'
}
