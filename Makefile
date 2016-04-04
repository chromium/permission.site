
SFTP_PATH     = "permission.site:~/permission.site/"
URL           = "https://permission.site/"

.PHOHY: deploy
deploy:
	rsync -avz --exclude .git . "${SFTP_PATH}"
	@echo "Done deploying. Go to ${URL}"

