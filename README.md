# Personal Website kellyawang.github.io

This website is built using Jekyll, a static website generator, and hosted on Github Pages. 

More info on Jekyll [here](https://jekyllrb.com/docs/)
> Jekyll is a static site generator. It takes text written in your favorite markup language and uses layouts to create a static website. You can tweak the site’s look and feel, URLs, the data displayed on the page, and more.

More info on Github Pages [here](https://pages.github.com/)

## Get Started
To get started with this repo, first pull down the repo from Github. Set up an ssh key following this tutorial: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

You will also need to install some dependencies to develop with Jekyll. Follow the instructions [here](https://jekyllrb.com/docs/installation/macos/)

## Development
Run the website locally using Jekyll:
```
gem install jekyll bundler
bundle exec jekyll serve
```
Browse to http://localhost:4000 to access the website.

## Troubleshooting Github
As of [Aug 13, 2021](https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations/), Github deprecated username-password authentication to Github for the command line. You should prob set up a Personal Access Token or SSH access instead:
> For developers, if you are using a password to authenticate Git operations with GitHub.com today, you must begin using a [personal access token](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token) over HTTPS (recommended) or SSH key by August 13, 2021, to avoid disruption. 

1. Set up SSH Keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/checking-for-existing-ssh-keys

2. If you get prompted for a username and get the error:
```
remote: Support for password authentication was removed on August 13, 2021. Please use a personal access token instead.
remote: Please see https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations/ for more information.
fatal: Authentication failed for 'https://github.com/kellyawang/kellyawang.github.io.git/'
```
you might need to switch the remote from HTTPS to SSH: https://docs.github.com/en/get-started/getting-started-with-git/managing-remote-repositories#switching-remote-urls-from-ssh-to-https