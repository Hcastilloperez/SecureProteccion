"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const database_1 = __importDefault(require("./config/database"));
const securityHeaders_1 = require("./middleware/securityHeaders");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(securityHeaders_1.securityHeaders);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api', routes_1.default);
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Error interno del servidor',
    });
});
const PORT = config_1.config.port;
async function main() {
    try {
        await database_1.default.$connect();
        console.log('Database connected successfully');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${config_1.config.nodeEnv}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
main();
process.on('SIGINT', async () => {
    await database_1.default.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await database_1.default.$disconnect();
    process.exit(0);
});
//# sourceMappingURL=index.js.map