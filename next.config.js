/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude MongoDB and other Node.js modules from client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        dns: false,
        tls: false,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        buffer: false,
        child_process: false,
        cluster: false,
        constants: false,
        dgram: false,
        events: false,
        readline: false,
        repl: false,
        string_decoder: false,
        sys: false,
        timers: false,
        tty: false,
        vm: false,
        worker_threads: false,
      };

      // Completely ignore MongoDB when bundling for client
      config.externals = config.externals || [];
      config.externals.push({
        mongodb: 'mongodb',
        'mongodb-client-encryption': 'mongodb-client-encryption'
      });
    }
    return config;
  },
  // Experimental features for better compatibility
  experimental: {
    esmExternals: 'loose'
  }
};

module.exports = nextConfig;