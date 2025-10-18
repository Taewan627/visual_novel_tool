#!/usr/bin/env node

/**
 * TW 모델 렌파이 비주얼노벨 생성기 실행 스크립트
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 로그 함수
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 포트 확인 함수
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// 사용 가능한 포트 찾기
async function findAvailablePort(startPort = 3000) {
  let port = startPort;
  
  while (!(await isPortAvailable(port))) {
    port++;
    if (port > startPort + 100) {
      throw new Error('사용 가능한 포트를 찾을 수 없습니다.');
    }
  }
  
  return port;
}

// 서버 시작 함수
async function startServer() {
  try {
    log('TW 모델 렌파이 비주얼노벨 생성기를 시작합니다...', 'cyan');
    log('=====================================', 'cyan');
    
    // 사용 가능한 포트 찾기
    const port = await findAvailablePort(3000);
    logInfo(`포트 ${port}에서 서버를 시작합니다.`);
    
    // Node.js 서버 시작 시도
    try {
      const serve = require('serve');
      const server = await serve(__dirname, {
        port: port,
        open: true,
        clipboard: false
      });
      
      logSuccess(`서버가 성공적으로 시작되었습니다!`);
      logInfo(`브라우저에서 http://localhost:${port}를 열어주세요.`);
      logInfo('서버를 중지하려면 Ctrl+C를 누르세요.');
      
      // 종료 신호 처리
      process.on('SIGINT', () => {
        logInfo('서버를 중지합니다...');
        server.stop();
        process.exit(0);
      });
      
    } catch (error) {
      // serve 모듈이 없는 경우 Python 서버 시도
      logWarning('serve 모듈을 찾을 수 없습니다. Python 서버를 시도합니다.');
      
      const { spawn } = require('child_process');
      const pythonProcess = spawn('python', ['-m', 'http.server', '8000'], {
        stdio: 'inherit',
        cwd: __dirname
      });
      
      logSuccess(`Python 서버가 성공적으로 시작되었습니다!`);
      logInfo(`브라우저에서 http://localhost:8000를 열어주세요.`);
      logInfo('서버를 중지하려면 Ctrl+C를 누르세요.');
      
      // 종료 신호 처리
      process.on('SIGINT', () => {
        logInfo('서버를 중지합니다...');
        pythonProcess.kill('SIGINT');
        process.exit(0);
      });
      
      pythonProcess.on('error', (error) => {
        logError(`Python 서버 시작 실패: ${error.message}`);
        logError('Python 3가 설치되어 있는지 확인해주세요.');
        process.exit(1);
      });
    }
    
  } catch (error) {
    logError(`서버 시작 실패: ${error.message}`);
    process.exit(1);
  }
}

// 도움말 표시
function showHelp() {
  log('TW 모델 렌파이 비주얼노벨 생성기', 'bright');
  log('=====================================', 'bright');
  log('');
  log('사용법:', 'yellow');
  log('  node start.js [옵션]', 'white');
  log('');
  log('옵션:', 'yellow');
  log('  --help, -h     도움말 표시', 'white');
  log('  --port, -p    사용할 포트 지정 (기본값: 3000)', 'white');
  log('  --no-open     브라우저 자동 열기 비활성화', 'white');
  log('');
  log('예시:', 'yellow');
  log('  node start.js              # 기본 설정으로 서버 시작', 'white');
  log('  node start.js --port 8080 # 포트 8080으로 서버 시작', 'white');
  log('  node start.js --no-open   # 브라우저 자동 열기 비활성화', 'white');
}

// 인자 파싱
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    port: 3000,
    open: true,
    help: false
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--port' || arg === '-p') {
      options.port = parseInt(args[++i]) || 3000;
    } else if (arg === '--no-open') {
      options.open = false;
    }
  }
  
  return options;
}

// 메인 함수
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }
  
  // 포트 유효성 검사
  if (isNaN(options.port) || options.port < 1 || options.port > 65535) {
    logError('유효하지 않은 포트입니다. 1-65535 사이의 포트를 사용해주세요.');
    process.exit(1);
  }
  
  // 파일 존재 확인
  const requiredFiles = ['index.html', 'js/app.js'];
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(__dirname, file))) {
      logError(`필수 파일을 찾을 수 없습니다: ${file}`);
      logError('프로젝트가 올바르게 설치되었는지 확인해주세요.');
      process.exit(1);
    }
  }
  
  // 서버 시작
  await startServer();
}

// 스크립트 실행
if (require.main === module) {
  main().catch(error => {
    logError(`예기치 않은 오류: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { startServer };