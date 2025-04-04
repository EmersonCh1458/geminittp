async function generateImage(prompt) {
  const apiKey = process.env.GOOGLE_API_KEY; // 从环境变量中获取密钥
  // 尝试备用模型名称，如果 gemini-2.0-flash-exp 不行，可以试试这个
  // const modelName = 'gemini-2.0-flash-exp-image-generation';
  const modelName = 'gemini-2.0-flash-exp-image-generation';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: `请生成一张关于 "${prompt}" 的图片` // 让提示更明确要求图片
          }
        ]
      }
    ],
    generationConfig: {
      responseModalities: ["Text", "Image"] // 指定生成文本和图像
    }
  });

  console.log('--- 开始图像生成请求 ---');
  console.log('请求 URL:', url.replace(apiKey, '******')); // 隐藏 API Key
  console.log('请求 Body:', body);

  try {
    const response = await fetch(url, { method: 'POST', headers, body });

    // 首先检查响应状态码
    console.log('API 响应状态码:', response.status, response.statusText);

    // 解析 JSON 响应体
    const data = await response.json();
    console.log('原始 API 响应 Body:', JSON.stringify(data, null, 2)); // !!! 打印完整的原始响应 !!!

    // 检查响应是否包含错误信息
    if (data.error) {
        console.error('API 返回错误:', data.error.message);
        throw new Error(`API 错误: ${data.error.message}`);
    }

    // 检查响应结构是否符合预期
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const parts = data.candidates[0].content.parts;
      console.log('响应中的 Parts:', JSON.stringify(parts, null, 2)); // 打印 parts 内容

      const imagePart = parts.find(part => part.inlineData && part.inlineData.data);

      if (imagePart) {
        const imageData = imagePart.inlineData.data;
        console.log('成功提取到 Base64 图像数据 (前 50 字符):', imageData.substring(0, 50) + '...');
        return `data:image/png;base64,${imageData}`; // 返回图像 URL
      } else {
        console.error('未在响应 parts 中找到包含 inlineData 的图像部分。');
        // 即使没有图像，也可能返回了文本或其他内容，可以考虑返回文本或特定错误信息
        const textPart = parts.find(part => part.text);
        if (textPart) {
            console.log('响应中只找到了文本部分:', textPart.text);
            // 可以选择抛出错误，或者返回文本提示
             throw new Error('模型返回了文本，但未生成图像。模型回复：' + textPart.text);
            // return `模型未生成图像，但回复了文本：${textPart.text}`;
        } else {
            throw new Error('API 响应中既未找到图像数据，也未找到文本部分。');
        }
      }
    } else {
      console.error('API 响应结构不符合预期，缺少 candidates 或 parts。');
      throw new Error('API 响应结构不符合预期，无法提取数据。');
    }
  } catch (error) {
    console.error('图像生成过程中发生错误:', error);
    // 抛出更具体的错误信息
    throw new Error(`图像生成失败: ${error.message || '未知错误，请检查控制台日志'}`);
  } finally {
      console.log('--- 结束图像生成请求 ---');
  }
}

module.exports = {
  generateImage
};
