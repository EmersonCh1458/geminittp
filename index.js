async function generateImage(prompt) {
      const apiKey = process.env.GOOGLE_API_KEY; // 从环境变量中获取密钥
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
          const headers = {
              'Content-Type': 'application/json',
                };
                  const body = JSON.stringify({
                      contents: [
                            {
                                    parts: [
                                              {
                                                          text: prompt // 用户输入的提示词
                                                                    }
                                                                            ]
                                                                                  }
                                                                                      ],
                                                                                          generationConfig: {
                                                                                                responseModalities: ["Text", "Image"] // 指定生成文本和图像
                                                                                                    }
                                                                                                      });

                                                                                                        try {
                                                                                                            const response = await fetch(url, { method: 'POST', headers, body });
                                                                                                                const data = await response.json();
                                                                                                                    // 从响应中提取图像数据（Base64 编码）
                                                                                                                        const imageData = data.candidates[0].content.parts.find(part => part.inlineData).inlineData.data;
                                                                                                                            return `data:image/png;base64,${imageData}`; // 返回图像 URL
                                                                                                                              } catch (error) {
                                                                                                                                  console.error('图像生成失败:', error);
                                                                                                                                      throw new Error('无法生成图像，请检查 API 密钥或网络连接');
                                                                                                                                        }
                                                                                                                                        }

                                                                                                                                        module.exports = {
                                                                                                                                          generateImage
                                                                                                                                          };
}
