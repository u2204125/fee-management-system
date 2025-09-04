exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'BTF Fee Management System is running on Netlify!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    })
  };
};
