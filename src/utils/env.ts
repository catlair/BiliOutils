type ENVType = {
  qinglong: boolean;
  fc: boolean;
  scf: boolean;
  cfc: boolean;
  agc: boolean;
  serverless: boolean;
  docker: boolean;
  type: ReturnType<typeof getEnvType>;
};

const ENV_BASE = {
  qinglong: isQingLongPanel(),
  fc: isFC(),
  scf: isSCF(),
  cfc: isCFC(),
  agc: isAGC(),
  fg: isFG(),
  docker: isDocker(),
};

const envType = ['scf', 'fc', 'agc', 'cfc', 'fg', 'qinglong', 'docker'] as const;

export const ENV: ENVType = {
  ...ENV_BASE,
  serverless: isServerless(),
  type: getEnvType(),
};

/**
 * 是否是青龙面板
 */
export function isQingLongPanel() {
  // @ts-ignore
  return Boolean(process.env.IS_QING_LONG || '__IS_QINGLONG__' === 'true' || process.env.QL_BRANCH);
}

/**
 * 是否是 CFC
 */
export function isCFC() {
  // @ts-ignore
  return (global.IS_CFC || '__IS_CFC__' === 'true') && !isFG();
}

/**
 * 是否是 AGC
 */
export function isAGC() {
  // @ts-ignore
  return '__IS_AGC__' === 'true';
}

function isFG() {
  const keys = Object.keys(process.env);
  const tags = [
    'RUNTIME_FSS_REPOSITORY_ROOT',
    '_APP_SHARE_DIR',
    'RUNTIME_FUNC_NAME',
    'RUNTIME_FUNC_VERSION',
    'RUNTIME_PROJECT_ID',
    'RUNTIME_INITIALIZER_HANDLER',
    'RUNTIME_TIMEOUT',
    'RUNTIME_ROOT',
  ];
  return keys.filter(key => tags.includes(key)).length >= 5;
}

export function setConfigFileName() {
  const defaultConfigFileName = ENV_BASE.qinglong ? 'cat_bili_config' : 'config',
    ext = '.json';

  const { BILITOOLS_FILE_NAME } = process.env;

  if (BILITOOLS_FILE_NAME) {
    if (BILITOOLS_FILE_NAME.endsWith(ext)) {
      return BILITOOLS_FILE_NAME;
    }
    return `${BILITOOLS_FILE_NAME}${ext}`;
  }

  return defaultConfigFileName + ext;
}

/**
 * 判断是否是 FC
 */
export function isFC() {
  const keys = Object.keys(process.env);
  const tags = [
    'securityToken',
    'accessKeyID',
    'accessKeySecret',
    'FC_FUNCTION_MEMORY_SIZE',
    'FC_FUNC_CODE_PATH',
    'FC_RUNTIME_VERSION',
  ];
  // @ts-ignore
  return keys.filter(key => tags.includes(key)).length >= 3 || '__IS_FC__' === 'true';
}

/**
 * 判断是否是 SCF
 */
export function isSCF() {
  const keys = Object.keys(process.env);
  const isSCF = keys.filter(key => key.startsWith('SCF_')).length >= 10;
  const isTENCENTCLOUD = keys.filter(key => key.startsWith('TENCENTCLOUD_')).length >= 3;
  // @ts-ignore
  return (isSCF && isTENCENTCLOUD) || '__IS_SCF__' === 'true';
}

export function isServerless() {
  return ['fc', 'scf', 'cfc', 'agc', 'fg'].some(key => ENV_BASE[key]);
}

function isDocker() {
  return require('fs').existsSync('/.dockerenv');
}

export function getEnvType() {
  return envType.find(key => ENV_BASE[key]) || process.platform || 'unknown';
}
