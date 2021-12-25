"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
function handleError(e, res) {
    console.log(e.stack);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}
exports.handleError = handleError;
//# sourceMappingURL=errorUtils.js.map