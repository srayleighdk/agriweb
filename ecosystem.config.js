module.exports = {
	  apps: [
		      {
			            name: 'agriweb',
			            cwd: '/home/ec2-user/agriweb',
			            script: 'node_modules/next/dist/bin/next',
			            args: 'start -p 3001',
			            instances: 1,
			            exec_mode: 'cluster',
			            env: {
					            NODE_ENV: 'production',
					            PORT: 3001,
					          },
			          },
		    ],
};

