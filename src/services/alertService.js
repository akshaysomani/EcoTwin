/**
 * Supabase Alerts Database Service
 * Manages fetching, inserting, acknowledging, and resolving alerts.
 */

import { supabase } from "../supabase";

const MACHINE_ID_INT = 1; // Constant integer mapped to ECOTWIN-001

function parseAlertMessage(row) {
  try {
    const parsed = JSON.parse(row.message);
    return {
      id: row.id,
      machineId: row.machine_id,
      alertType: row.alert_type,
      severity: row.severity ? row.severity.toUpperCase() : "INFO",
      title: parsed.title || `${row.alert_type} Alert`,
      message: parsed.message || row.message,
      status: parsed.status || (row.resolved ? "RESOLVED" : "ACTIVE"),
      source: parsed.source || "HEALTH_ENGINE",
      dedupeKey: parsed.dedupeKey || `ECOTWIN-001:${row.alert_type}`,
      created_at: row.created_at,
      acknowledged_at: parsed.acknowledged_at || null,
      resolved_at: parsed.resolved_at || null,
      metadata: parsed.metadata || {},
      health_score: row.health_score,
      resolved: row.resolved
    };
  } catch {
    // Graceful fallback for non-JSON legacy alerts
    return {
      id: row.id,
      machineId: row.machine_id,
      alertType: row.alert_type,
      severity: row.severity ? row.severity.toUpperCase() : "INFO",
      title: `${row.alert_type.toUpperCase()} Status`,
      message: row.message,
      status: row.resolved ? "RESOLVED" : "ACTIVE",
      source: "HEALTH_ENGINE",
      dedupeKey: `ECOTWIN-001:${row.alert_type}:${row.id}`,
      created_at: row.created_at,
      acknowledged_at: null,
      resolved_at: null,
      metadata: {},
      health_score: row.health_score,
      resolved: row.resolved
    };
  }
}

export const alertService = {
  // Fetch active or acknowledged un-resolved alerts
  async fetchActiveAlerts() {
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("machine_id", MACHINE_ID_INT)
        .eq("resolved", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching active database alerts:", error);
        return [];
      }
      return (data || []).map(parseAlertMessage);
    } catch (err) {
      console.error("fetchActiveAlerts execution failure:", err);
      return [];
    }
  },

  // Fetch all alerts for audit history logs
  async fetchAlertHistory() {
    try {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .eq("machine_id", MACHINE_ID_INT)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching alert history:", error);
        return [];
      }
      return (data || []).map(parseAlertMessage);
    } catch (err) {
      console.error("fetchAlertHistory execution failure:", err);
      return [];
    }
  },

  // Inserts a new alert into the database
  async createAlert(alert) {
    try {
      const payload = {
        machine_id: MACHINE_ID_INT,
        alert_type: alert.alertType,
        severity: alert.severity.toLowerCase(),
        health_score: alert.metadata?.healthScore || 100,
        resolved: false,
        message: JSON.stringify({
          title: alert.title,
          message: alert.message,
          status: "ACTIVE",
          source: alert.source,
          dedupeKey: alert.dedupeKey,
          acknowledged_at: null,
          resolved_at: null,
          metadata: alert.metadata || {}
        })
      };

      const { data, error } = await supabase
        .from("alerts")
        .insert([payload])
        .select();

      if (error) {
        console.error("Error creating database alert:", error);
        return null;
      }
      return data && data.length > 0 ? parseAlertMessage(data[0]) : null;
    } catch (err) {
      console.error("createAlert execution failure:", err);
      return null;
    }
  },

  // Set alert status to ACKNOWLEDGED
  async acknowledgeAlert(id, currentAlert) {
    try {
      const updatedMessage = {
        title: currentAlert.title,
        message: currentAlert.message,
        status: "ACKNOWLEDGED",
        source: currentAlert.source,
        dedupeKey: currentAlert.dedupeKey,
        acknowledged_at: new Date().toISOString(),
        resolved_at: currentAlert.resolved_at,
        metadata: currentAlert.metadata || {}
      };

      const { data, error } = await supabase
        .from("alerts")
        .update({
          message: JSON.stringify(updatedMessage)
        })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error acknowledging alert:", error);
        return null;
      }
      return data && data.length > 0 ? parseAlertMessage(data[0]) : null;
    } catch (err) {
      console.error("acknowledgeAlert execution failure:", err);
      return null;
    }
  },

  // Set alert status to RESOLVED
  async resolveAlert(id, currentAlert) {
    try {
      const updatedMessage = {
        title: currentAlert.title,
        message: currentAlert.message,
        status: "RESOLVED",
        source: currentAlert.source,
        dedupeKey: currentAlert.dedupeKey,
        acknowledged_at: currentAlert.acknowledged_at,
        resolved_at: new Date().toISOString(),
        metadata: currentAlert.metadata || {}
      };

      const { data, error } = await supabase
        .from("alerts")
        .update({
          resolved: true,
          message: JSON.stringify(updatedMessage)
        })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error resolving alert:", error);
        return null;
      }
      return data && data.length > 0 ? parseAlertMessage(data[0]) : null;
    } catch (err) {
      console.error("resolveAlert execution failure:", err);
      return null;
    }
  }
};
