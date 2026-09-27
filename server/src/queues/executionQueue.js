const env = require('../config/env');

let Queue = null;
let Worker = null;
let isRedisAvailable = false;

try {
  const BullMQ = require('bullmq');
  Queue = BullMQ.Queue;
  Worker = BullMQ.Worker;
} catch (err) {
  console.log('[Queue] BullMQ module not installed or failing. In-memory queue fallback will be used.');
}

class ExecutionQueueHandler {
  constructor() {
    this.bullQueue = null;
    this.inMemoryJobs = [];
    this.processor = null;
  }

  init(processorFn) {
    this.processor = processorFn;

    if (Queue && env.REDIS_URL) {
      try {
        const IORedis = require('ioredis');
        let hasLoggedRedisError = false;
        const connection = new IORedis(env.REDIS_URL, { 
          maxRetriesPerRequest: 1,
          retryStrategy: () => null,
          enableOfflineQueue: false
        });
        
        connection.on('connect', () => {
          console.log('[Queue] Connected to Redis. Initializing BullMQ.');
          isRedisAvailable = true;
          this.bullQueue = new Queue('executionQueue', { connection });
          new Worker('executionQueue', async (job) => {
            return await this.processor(job.data);
          }, { connection });
        });

        connection.on('error', (err) => {
          if (!isRedisAvailable && !hasLoggedRedisError) {
            hasLoggedRedisError = true;
            console.log('[Queue] Redis connection unavailable. Operating in IN-MEMORY queue processor mode.');
          }
        });
      } catch (e) {
        console.log('[Queue] Operating in IN-MEMORY async queue processor mode.');
      }
    } else {
      console.log('[Queue] Redis URL missing or BullMQ disabled. Operating in IN-MEMORY async queue processor mode.');
    }
  }

  async addJob(jobData) {
    if (isRedisAvailable && this.bullQueue) {
      return await this.bullQueue.add('runExecution', jobData);
    } else {
      // Async in-memory execution fallback
      setTimeout(async () => {
        if (this.processor) {
          try {
            await this.processor(jobData);
          } catch (err) {
            console.error('[Queue] In-memory job execution error:', err.message);
          }
        }
      }, 50);
      return { id: `inmem_${Date.now()}` };
    }
  }
}

const queueHandler = new ExecutionQueueHandler();
module.exports = queueHandler;
