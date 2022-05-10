
function cd {
  # actually change the directory with all args passed to the function
  builtin cd "$@"

  case $PWD/ in
    /Users/edrlab/Documents/edrlab/projects/lis-mon-livre-project/lis-mon-livre-edrlab/webhooks/functions/*)
      node14
      ;;
  esac
}
