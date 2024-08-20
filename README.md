# Personal Website kellyawang.github.io

This website is built using Jekyll, a static website generator, and hosted on Github Pages. 

More info on Jekyll [here](https://jekyllrb.com/docs/)
> Jekyll is a static site generator. It takes text written in your favorite markup language and uses layouts to create a static website. You can tweak the site’s look and feel, URLs, the data displayed on the page, and more.

More info on Github Pages [here](https://pages.github.com/)

## Get Started
To get started with this repo, first pull down the repo from Github. Set up an ssh key following this tutorial: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent

Next, pull down the repo from Github. Since this repo contains a subrepo, be sure to clone submodules as well. https://github.blog/2016-02-01-working-with-submodules/
```
git clone --recurse-submodules <website github url>
```

Note: in case the submodule changes, use this to pull down remote changes from the master branch: `git submodule update --remote` ([source](https://git-scm.com/book/en/v2/Git-Tools-Submodules))

You will also need to install some dependencies to develop with Jekyll. Follow the instructions [here](https://jekyllrb.com/docs/installation/macos/), but as part of the prerequisites section, install RVM and install Ruby using RVM.

### To install rvm:
https://rvm.io/rvm/basics

## Development
Ensure you are using the correct version of Ruby by running `rvm use`. Rvm will try to load the Ruby version in the `.ruby-version` file. If you don't have that version installed, rvm will prompt you to install it. More info [here](https://rvm.io/workflow/projects). 

### To install Ruby version required to work with Jekyll using rvm:
```
rvm list known
rvm install 2.5.0
```

Run the website locally using Jekyll:
```
bundle install
bundle exec jekyll serve
```
Browse to http://localhost:4000 to access the website.

## Troubleshooting Github
In [2023](https://github.blog/news-insights/company-news/we-updated-our-rsa-ssh-host-key/) Github updated their RSA Host key. Follow doc to resolve the warning.

As of [Aug 13, 2021](https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations/), Github deprecated username-password authentication to Github for the command line. You should prob set up a Personal Access Token or SSH access instead:
> For developers, if you are using a password to authenticate Git operations with GitHub.com today, you must begin using a [personal access token](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token) over HTTPS (recommended) or SSH key by August 13, 2021, to avoid disruption. 

1. Set up SSH Keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh/checking-for-existing-ssh-keys

2. If you get prompted for a username and get the error:
```
remote: Support for password authentication was removed on August 13, 2021. Please use a personal access token instead.
remote: Please see https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations/ for more information.
fatal: Authentication failed for 'https://github.com/kellyawang/kellyawang.github.io.git/'
```
you might need to switch the remote from HTTPS to SSH: https://docs.github.com/en/get-started/getting-started-with-git/managing-remote-repositories#switching-remote-urls-from-https-to-ssh
```