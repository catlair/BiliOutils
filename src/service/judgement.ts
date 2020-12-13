import { JuryVoteOption } from '../interface/Jury';
import { JuryCaseInfoDto } from '../dto/Jury.dto';
import {
  juryCaseInfo,
  juryCaseObtain,
  juryInfo,
  juryVote,
  juryVoteOpinion,
} from '../net/juryRequest';
import { JuryTask } from '../config/globalVar';
import { apiDelay } from '../util';

enum Vote {
  '未投票',
  '封禁',
  '保留',
  '弃权',
  '删除',
}

/**
 * 获取个人仲裁信息
 */
async function getJuryInfo() {
  const { data, code, message } = await juryInfo();
  if (code === 25005) {
    console.log('未成为风纪委员,请在小黑屋中进行申请');
    return;
  }
  if (code !== 0) {
    console.log('获取个人信息失败!!! ', message);
    return;
  }
  if (data.status === 2) {
    console.log('你的风纪委员资格已经过期!');
    return;
  }
  JuryTask.isJury = true;
  return {
    caseTotal: data.caseTotal,
    rightRadio: data.rightRadio,
  };
}

/**
 * 获取一个案件
 */
async function getJuryCaseObtain() {
  const { data, code, message } = await juryCaseObtain();
  if (code === 25008) {
    console.log('没有新的案件了');
    JuryTask.isRun = false;
    return;
  }
  if (code === 25014) {
    console.log('今日的案件已经审核完成');
    JuryTask.isRun = false;
    return;
  }
  if (code !== 0) {
    console.log('获取案件失败: ', message);
    return;
  }
  return data.id;
}

/**
 * 获取一个案件的详细信息
 * @param cid 案件id
 */
async function getJuryCaseInfo(
  cid: number | string,
): Promise<JuryCaseInfoDto['data']> {
  const { data, message, code } = await juryCaseInfo(cid);
  if (code !== 0) {
    console.log('获取案件详情失败: ', message);
    return;
  }
  return data;
}

/**
 * 获取正反方留言人数
 * @param cid 案件id
 * @param otype 1 支持删除 2 支持保留
 */
async function getJuryVoteOpinion(cid: string | number, otype: 1 | 2 = 1) {
  try {
    const { data, message, code } = await juryVoteOpinion(cid, otype);
    if (code !== 0) {
      console.log('获取案件意见失败(仅报告): ', message);
      return 0;
    }
    return data.count;
  } catch (error) {
    console.log('获取案件意见异常(仅报告): ', error);
    return 0;
  }
}

async function doOneJuryVote() {
  try {
    /** 获取一下信息 */
    const userInfo = await getJuryInfo();
    if (userInfo === undefined) return;
    await apiDelay(600);

    /** 获取一个案件 */
    const caseObtainId = await getJuryCaseObtain();
    if (caseObtainId === undefined) return;
    await apiDelay(600);

    /** 获取案件的详细信息 */
    const caseObtainInfo = await getJuryCaseInfo(caseObtainId);
    if (caseObtainInfo === undefined) return;

    const { voteBreak, voteDelete, voteRule } = caseObtainInfo;

    await apiDelay();
    /** 获取双方评论人数 */
    const voteOpinionRed = await getJuryVoteOpinion(1);
    const voteOpinionBlue = await getJuryVoteOpinion(2);

    let myVote = 0;

    //瞎鸡*巴计算怎么投票

    //大家都说你
    if (voteOpinionRed >= 12 && voteOpinionBlue == 0) {
      myVote = 1;
    } else if (voteDelete > 200 && voteRule < 20) {
      myVote = 2;
    } else if (voteRule > voteDelete * 2 && voteRule > 200) {
      //保留的人多
      myVote = 2;
    } else if (voteDelete > voteRule * 2 && voteRule > 100) {
      //删除的人多
      myVote = 4;
    } else if (voteOpinionRed >= 5 && voteOpinionBlue <= 1) {
      //删除的人还是挺多的
      myVote = 4;
    } else if (voteOpinionBlue >= 7 && voteOpinionRed === 0) {
      //保留的人确实多
      if (voteRule > voteDelete) {
        myVote = 2;
      } else {
        myVote = 4;
      }
    } else if (voteDelete > voteRule && voteOpinionRed > voteOpinionBlue) {
      myVote = 4;
    } else if (voteDelete < voteRule && voteOpinionRed < voteOpinionBlue) {
      myVote = 4;
    } else {
      //投删除就对了
      myVote = 4;
    }
    /** 投票配置 */
    const options: JuryVoteOption = { attr: 1, vote: 1 };

    await apiDelay();
    /** 投票 */
    const { code, message } = await juryVote(caseObtainId, options);
    if (code === 25012) {
      console.log('重复投票');
      return;
    }
    if (code === -400) {
      console.log('参数错误: ', message);
      return;
    }
    if (code !== 0) {
      console.log('投票失败: ', message);
      return;
    }

    JuryTask.caseTotal++;
    console.log(
      `
      处理案件数:${JuryTask.caseTotal} -- 案件id:${caseObtainId} 
      红方人数:${voteDelete}/评论数:${voteOpinionRed}
      蓝方人数:${voteRule}/评论数:${voteOpinionBlue}
      弃权人数:${voteBreak}
      本人投票:【${Vote[myVote]}】
      `,
    );
  } catch (error) {
    console.log('风纪委员投票异常', error);
  }
}

export default async function judgement() {
  console.log('----【风纪委员任务】----');

  while (JuryTask.isRun) {
    await doOneJuryVote();
    await apiDelay();
  }

  console.log(`一共处理了${JuryTask.caseTotal}件案件`);
}
