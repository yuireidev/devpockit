import type { CronParserOptions } from '@/config/cron-parser-config'

export interface ExportFormat {
  id: string
  name: string
  description: string
  extension: string
}

export const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'plain',
    name: 'Plain Cron Expression',
    description: 'Standard cron expression',
    extension: 'txt',
  },
  {
    id: 'json',
    name: 'JSON Config',
    description: 'JSON configuration object',
    extension: 'json',
  },
  {
    id: 'javascript',
    name: 'JavaScript (node-cron)',
    description: 'Node.js node-cron format',
    extension: 'js',
  },
  {
    id: 'python',
    name: 'Python (APScheduler)',
    description: 'Python APScheduler cron format',
    extension: 'py',
  },
  {
    id: 'go',
    name: 'Go (robfig/cron)',
    description: 'Go robfig/cron format',
    extension: 'go',
  },
  {
    id: 'java',
    name: 'Java (Quartz)',
    description: 'Java Quartz cron format',
    extension: 'java',
  },
  {
    id: 'docker',
    name: 'Docker Compose',
    description: 'Docker Compose cron format',
    extension: 'yml',
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes CronJob',
    description: 'Kubernetes CronJob YAML',
    extension: 'yaml',
  },
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    description: 'GitHub Actions workflow cron',
    extension: 'yml',
  },
]

/**
 * Export cron expression in various formats
 */
export function exportCronExpression(expression: string, format: string, options?: CronParserOptions): string {
  switch (format) {
    case 'plain':
      return expression

    case 'json':
      return exportAsJson(expression, options)

    case 'javascript':
      return exportAsJavaScript(expression)

    case 'python':
      return exportAsPython(expression)

    case 'go':
      return exportAsGo(expression)

    case 'java':
      return exportAsJava(expression)

    case 'docker':
      return exportAsDocker(expression)

    case 'kubernetes':
      return exportAsKubernetes(expression)

    case 'github-actions':
      return exportAsGitHubActions(expression)

    default:
      return expression
  }
}

function exportAsJson(expression: string, options?: CronParserOptions): string {
  const config = {
    cron: expression,
    description: 'Generated cron expression',
    timezone: options?.timezone || 'UTC',
    fields: {
      minute: options?.minute,
      hour: options?.hour,
      day: options?.day,
      month: options?.month,
      weekday: options?.weekday,
    },
  }
  return JSON.stringify(config, null, 2)
}

function exportAsJavaScript(expression: string): string {
  return `const cron = require('node-cron');

// Cron expression: ${expression}
cron.schedule('${expression}', () => {
  // Your task here
  console.log('Task executed');
});`
}

function exportAsPython(expression: string): string {
  return `from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

scheduler = BlockingScheduler()

# Cron expression: ${expression}
scheduler.add_job(
    func=your_function,
    trigger=CronTrigger.from_crontab('${expression}'),
    id='job_id',
    name='Job description'
)

scheduler.start()`
}

function exportAsGo(expression: string): string {
  return `package main

import (
    "github.com/robfig/cron/v3"
    "fmt"
)

func main() {
    c := cron.New()

    // Cron expression: ${expression}
    c.AddFunc("${expression}", func() {
        // Your task here
        fmt.Println("Task executed")
    })

    c.Start()
    defer c.Stop()

    // Keep the program running
    select {}
}`
}

function exportAsJava(expression: string): string {
  return `import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;

public class CronJob {
    public static void main(String[] args) throws SchedulerException {
        Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();

        JobDetail job = JobBuilder.newJob(YourJob.class)
            .withIdentity("job1", "group1")
            .build();

        // Cron expression: ${expression}
        Trigger trigger = TriggerBuilder.newTrigger()
            .withIdentity("trigger1", "group1")
            .withSchedule(CronScheduleBuilder.cronSchedule("${expression}"))
            .build();

        scheduler.scheduleJob(job, trigger);
        scheduler.start();
    }
}`
}

function exportAsDocker(expression: string): string {
  return `version: '3.8'

services:
  cron-job:
    image: your-image:latest
    command: /path/to/script.sh
    restart: unless-stopped
    environment:
      - CRON_SCHEDULE=${expression}
    # Or use a cron service
    # depends_on:
    #   - cron-service

  # Alternative: Use a dedicated cron service
  cron-service:
    image: mcuadros/ofelia:latest
    command: daemon --docker
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    labels:
      - "ofelia.job-exec.${expression}.image=your-image:latest"
      - "ofelia.job-exec.${expression}.command=/path/to/script.sh"`
}

function exportAsKubernetes(expression: string): string {
  return `apiVersion: batch/v1
kind: CronJob
metadata:
  name: cron-job
  namespace: default
spec:
  schedule: "${expression}"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cron-job
            image: your-image:latest
            command:
            - /bin/sh
            - -c
            - /path/to/script.sh
          restartPolicy: OnFailure
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1`
}

function exportAsGitHubActions(expression: string): string {
  return `name: Scheduled Job

on:
  schedule:
    # Cron expression: ${expression}
    - cron: '${expression}'
  workflow_dispatch: # Allow manual trigger

jobs:
  scheduled-job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run task
        run: |
          echo "Task executed"
          # Your commands here`
}
