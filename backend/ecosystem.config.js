/**
 * PM2 Ecosystem Configuration for High Traffic
 * 
 * Usage:
 * pm2 start ecosystem.config.js --env production
 * pm2 logs
 * pm2 monit
 * pm2 restart all
 * pm2 stop all
 */

module.exports = {
  apps: [
    {
      name: 'everest-backend',
      script: './server.js',
      
      // Cluster mode for load balancing
      instances: 'max', // Use all CPU cores, or specify a number like 4
      exec_mode: 'cluster',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 5002
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5002
      },
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Auto restart configuration
      watch: false, // Set to true for development
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      max_memory_restart: '500M', // Restart if memory exceeds 500MB
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Auto restart on crash
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Cron restart (optional - restart every day at 3 AM)
      cron_restart: '0 3 * * *',
      
      // Advanced features
      instance_var: 'INSTANCE_ID',
      
      // Health check
      health_check: {
        enable: true,
        interval: 30000, // 30 seconds
        threshold: 3 // Restart after 3 failed checks
      }
    }
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:username/everest.git',
      path: '/var/www/everest',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
