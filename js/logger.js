const logLevels = {
    alert: 'alert',
    info: 'info',
    debug: 'debug',
    trace: 'trace',
    error: 'error',
    exception: 'exception'
}

const writeLog = function (logLevel, logMessage, usertag) {
    switch (logLevel) {
        case (logLevels.alert):
            alert('WaliedCheetos - ' + logMessage);
            break;
        case (logLevels.info):
            console.info('WaliedCheetos - ' + logMessage);
            break;
        case (logLevels.debug):
            console.debug('WaliedCheetos - ' + logMessage);
            break;
        case (logLevels.trace):
            console.trace('WaliedCheetos - ' + logMessage);
            break;
        case (logLevels.error):
            console.error('WaliedCheetos - ' + logMessage);
            break;
        case (logLevels.exception):
            console.error('WaliedCheetos - ' + logMessage);
            break;
        default:
            console.info('WaliedCheetos - ' + logMessage);
            break;
    }
};

export { logLevels, writeLog }