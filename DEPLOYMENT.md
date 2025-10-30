# Kasra Deployment Guide

This guide provides step-by-step instructions for deploying the Kasra BNPL application to production.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Hedera Account**
   - Create a Hedera Testnet account at [portal.hedera.com](https://portal.hedera.com)
   - Fund your account with test HBAR
   - Save your Account ID and Private Key securely

2. **Node.js Environment**
   - Node.js v14 or higher
   - npm or yarn package manager

3. **Domain & Hosting** (Optional)
   - Domain name for production
   - VPS or cloud hosting (AWS, DigitalOcean, Heroku, etc.)

## 🔧 Local Development Setup

### 1. Install Dependencies

```bash
cd kasra-hedera-dapp
npm install --legacy-peer-deps
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
# Hedera Network Configuration
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=YOUR_PRIVATE_KEY
MERCHANT_ID=0.0.MERCHANT_ACCOUNT_ID

# Smart Contract (After deployment)
BNPL_CONTRACT_ID=0.0.CONTRACT_ID

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional: Mirror Node API
MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
```

### 3. Start Development Server

```bash
node server.cjs
```

Visit `http://localhost:3000` to test the application.

## 🚀 Production Deployment

### Option 1: Deploy to Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create kasra-bnpl
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
   heroku config:set OPERATOR_KEY=YOUR_PRIVATE_KEY
   heroku config:set MERCHANT_ID=0.0.MERCHANT_ACCOUNT_ID
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Open Application**
   ```bash
   heroku open
   ```

### Option 2: Deploy to DigitalOcean

1. **Create Droplet**
   - Ubuntu 22.04 LTS
   - Minimum 1GB RAM
   - SSH access enabled

2. **SSH into Server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/kasra-hedera-dapp.git
   cd kasra-hedera-dapp
   ```

5. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps --production
   ```

6. **Configure Environment**
   ```bash
   nano .env
   # Add your environment variables
   ```

7. **Install PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   ```

8. **Start Application**
   ```bash
   pm2 start server.cjs --name kasra
   pm2 save
   pm2 startup
   ```

9. **Configure Nginx (Optional)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/kasra
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/kasra /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Setup SSL with Let's Encrypt**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

### Option 3: Deploy to AWS EC2

1. **Launch EC2 Instance**
   - Amazon Linux 2 or Ubuntu
   - t2.micro or larger
   - Configure security group (ports 22, 80, 443, 3000)

2. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. **Install Node.js**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 18
   ```

4. **Follow steps 4-10 from DigitalOcean guide**

## 🔐 Smart Contract Deployment

### 1. Compile Contract

```bash
npx hardhat compile
```

### 2. Deploy to Hedera Testnet

Create `scripts/deploy.js`:

```javascript
const { Client, ContractCreateFlow, ContractFunctionParameters } = require("@hashgraph/sdk");
const fs = require("fs");

async function main() {
    const client = Client.forTestnet();
    client.setOperator(
        process.env.OPERATOR_ID,
        process.env.OPERATOR_KEY
    );

    const bytecode = fs.readFileSync("artifacts/contracts/KasraBNPL.sol/KasraBNPL.json");
    const contractBytecode = JSON.parse(bytecode).bytecode;

    const contractCreate = new ContractCreateFlow()
        .setGas(100000)
        .setBytecode(contractBytecode);

    const contractCreateSubmit = await contractCreate.execute(client);
    const contractCreateRx = await contractCreateSubmit.getReceipt(client);
    const contractId = contractCreateRx.contractId;

    console.log(`Contract deployed with ID: ${contractId}`);
    console.log(`Update your .env file with: BNPL_CONTRACT_ID=${contractId}`);
}

main();
```

Run deployment:
```bash
node scripts/deploy.js
```

### 3. Update Environment Variables

Add the contract ID to your `.env` file:
```env
BNPL_CONTRACT_ID=0.0.YOUR_CONTRACT_ID
```

## 🧪 Testing Production Deployment

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-10-15T12:00:00.000Z"
}
```

### 2. Test Wallet Connection
- Visit homepage
- Click "Connect Wallet"
- Verify wallet connection flow

### 3. Test Shopping Flow
- Browse products
- Add items to cart
- Proceed to checkout
- Test payment methods

### 4. Test Dashboard
- Connect wallet
- Navigate to dashboard
- Verify order display
- Test installment payment

## 📊 Monitoring & Maintenance

### Application Logs

**PM2 Logs:**
```bash
pm2 logs kasra
```

**View Specific Logs:**
```bash
pm2 logs kasra --lines 100
```

### Performance Monitoring

**PM2 Monitoring:**
```bash
pm2 monit
```

**Server Resources:**
```bash
htop
```

### Database Backup (Future)

When implementing database:
```bash
# Backup
pg_dump kasra_db > backup.sql

# Restore
psql kasra_db < backup.sql
```

## 🔄 Updates & Maintenance

### Update Application

```bash
cd kasra-hedera-dapp
git pull origin main
npm install --legacy-peer-deps
pm2 restart kasra
```

### Update Dependencies

```bash
npm update
npm audit fix
pm2 restart kasra
```

## 🚨 Troubleshooting

### Server Won't Start

**Check logs:**
```bash
pm2 logs kasra --err
```

**Common issues:**
- Missing environment variables
- Port already in use
- Node version mismatch

### Wallet Connection Issues

**Check:**
- Browser console for errors
- Network connectivity
- Wallet extension installed
- Correct network (Testnet vs Mainnet)

### Payment Failures

**Verify:**
- Hedera account has sufficient balance
- Contract ID is correct
- API credentials are valid
- Network is accessible

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` to version control
   - Use secure secret management (AWS Secrets Manager, etc.)

2. **API Keys**
   - Rotate keys regularly
   - Use separate keys for dev/staging/prod

3. **HTTPS**
   - Always use SSL in production
   - Redirect HTTP to HTTPS

4. **Rate Limiting**
   - Implement rate limiting on API endpoints
   - Use tools like `express-rate-limit`

5. **Input Validation**
   - Validate all user inputs
   - Sanitize data before processing

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Deploy multiple instances
- Implement session management

### Database Scaling
- Use connection pooling
- Implement caching (Redis)
- Consider read replicas

### CDN Integration
- Serve static assets via CDN
- Use CloudFlare or AWS CloudFront

## 📞 Support

For deployment issues:
- Check logs first
- Review environment configuration
- Test locally before deploying
- Contact support if needed

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Smart contract deployed
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Firewall rules set
- [ ] Monitoring enabled
- [ ] Backup strategy implemented
- [ ] Health check passing
- [ ] Wallet connection tested
- [ ] Payment flow tested
- [ ] Dashboard functional

---

**Ready to deploy? Follow this guide step-by-step and your Kasra BNPL platform will be live!**

