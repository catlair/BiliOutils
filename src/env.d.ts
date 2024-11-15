declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PUSHPLUS_TOKEN?: string;
      IS_LOCAL?: string;
      BILITOOLS_CONFIG?: string;
      BILITOOLS_CRON?: string;
      LIVE_HEART_FORCE?: string;
      TENCENT_SECRET_ID?: string;
      TENCENT_SECRET_KEY?: string;
      ALI_SECRET_ID?: string;
      ALI_SECRET_KEY?: string;
      CONFIG_ITEM_INDEX?: string;
      /**
       * @deprecated
       */
      USE_NETWORK_CODE?: string;
      /**
       * @deprecated
       */
      BILITOOLS_IS_ASYNC?: string;
      BILIOUTILS_LOG_CLEAR_DAY?: string;
      BILIOUTILS_LOG_DIR?: string;
      BILIOUTILS_DETACHED?: string;
      BILIOUTILS_ASYNC?: string;
      BO_CONFIG?: string;
      /** 私有变量 */
      __BT_CONFIG__: string;
      __BT_TASKS_STRING__: string;
      __BT_CONFIG_PATH__: string;
      __BT_CONFIG_ITEM__: string;
      /** VM 相关私有变量 */
      __BT_VM_CONTEXT__: string;
    }
  }
}
export {};
