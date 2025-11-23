"""
Health check endpoint for monitoring and Azure Container Apps health probes
"""
import logging
from datetime import datetime
from django.http import JsonResponse
from django.db import connection
from django.conf import settings

logger = logging.getLogger(__name__)


def health_check(request):
    """
    Health check endpoint that returns application status.
    
    Returns:
        - HTTP 200: Application is healthy
        - HTTP 503: Application has issues
    
    Used by:
        - Azure Container Apps health probes
        - Monitoring systems
        - DevOps dashboards
    """
    status = "healthy"
    status_code = 200
    checks = {}
    
    # Check 1: Database connectivity
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        checks["database"] = "connected"
        logger.debug("Database health check: OK")
    except Exception as e:
        checks["database"] = f"error: {str(e)}"
        status = "unhealthy"
        status_code = 503
        logger.error(f"Database health check failed: {e}")
    
    # Check 2: Storage configuration
    try:
        if hasattr(settings, 'AZURE_ACCOUNT_NAME') and settings.AZURE_ACCOUNT_NAME:
            checks["storage"] = "azure_blob_configured"
        else:
            checks["storage"] = "local_storage"
        logger.debug("Storage configuration check: OK")
    except Exception as e:
        checks["storage"] = f"error: {str(e)}"
        logger.warning(f"Storage configuration check failed: {e}")
    
    # Build response
    response_data = {
        "status": status,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0",
        "application": "BiteSnap",
        "checks": checks
    }
    
    # Log health check request
    if status == "healthy":
        logger.info(f"Health check passed - all systems operational")
    else:
        logger.error(f"Health check failed - status: {status}, checks: {checks}")
    
    return JsonResponse(response_data, status=status_code)

