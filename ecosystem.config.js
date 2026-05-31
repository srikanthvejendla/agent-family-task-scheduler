module.exports = {
  apps: [
    {
      name: "family-task-scheduler",
      script: ".next/standalone/server.js",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 8003,
        HOSTNAME: process.env.HOSTNAME || "0.0.0.0",
      },
      env_file: ".env",
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      merge_logs: true,
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      max_memory_restart: "500M",
    },
  ],
};
