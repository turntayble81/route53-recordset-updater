# Route53 Record Set Updater

This little NodeJS script can be set on a cron to keep an AWS Route53 record set updated with a dynamic IP. A common use would be to add DNS to a home server.

## Installation

1. Clone this repo
2. Install dependencies: `npm install`
3. Edit `config.js`. Update with your hosted zone/record set information
4. Run `./route53Updater.js
5. Optionally set up a cron job to run this regularly.

## Notes

- This script will read AWS credentials from `~/.aws/credentials` or from EC2 IAM role. For info on creating an aws credentials file, take a look here: https://docs.aws.amazon.com/cli/latest/userguide/cli-config-files.html
- If you set up to run as a cron job, don't run more often than every 30 minutes. It's calling a 3rd party API to determine your WAN IP, and excessive calls will be rejected.