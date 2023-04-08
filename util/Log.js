import winston from 'winston';

export default winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(msg => `${msg.timestamp} - ${msg.level}: ${msg.message}`)
    ),
    transports: [
        new winston.transports.Console()
    ]
})
