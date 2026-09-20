// GENERATED FILE — do not edit. Source: packages/design-tokens/src
// Flutter portability PROOF only. Not a Flutter application.
// ignore_for_file: dangling_library_doc_comments

import 'package:flutter/painting.dart';

/// Semantic colors for one FleetSplice theme.
class FleetSpliceColors {
  const FleetSpliceColors({
    required this.canvas,
    required this.surface,
    required this.panel,
    required this.raised,
    required this.text,
    required this.textMuted,
    required this.border,
    required this.hover,
    required this.accent,
    required this.onAccent,
    required this.accentHover,
    required this.selected,
    required this.selectedText,
    required this.focus,
    required this.online,
    required this.offline,
    required this.success,
    required this.attention,
    required this.warning,
    required this.danger,
    required this.streaming,
    required this.tool,
    required this.warningBg,
    required this.warningText,
    required this.warningBorder,
    required this.footer,
    required this.shadowColor,
  });

  final Color canvas;
  final Color surface;
  final Color panel;
  final Color raised;
  final Color text;
  final Color textMuted;
  final Color border;
  final Color hover;
  final Color accent;
  final Color onAccent;
  final Color accentHover;
  final Color selected;
  final Color selectedText;
  final Color focus;
  final Color online;
  final Color offline;
  final Color success;
  final Color attention;
  final Color warning;
  final Color danger;
  final Color streaming;
  final Color tool;
  final Color warningBg;
  final Color warningText;
  final Color warningBorder;
  final Color footer;
  final Color shadowColor;
}

/// Shared spacing / radii / controls / motion (platform-neutral values).
class FleetSpliceMetrics {
  const FleetSpliceMetrics({
    required this.space1,
    required this.space2,
    required this.space3,
    required this.space4,
    required this.space5,
    required this.space6,
    required this.radiusSm,
    required this.radiusMd,
    required this.radiusLg,
    required this.compactHeight,
    required this.touchHeight,
    required this.typeBody,
    required this.typeSmall,
    required this.typeLabel,
    required this.typeTitle,
    required this.fastDurationMs,
    required this.normalDurationMs,
  });

  final double space1;
  final double space2;
  final double space3;
  final double space4;
  final double space5;
  final double space6;
  final double radiusSm;
  final double radiusMd;
  final double radiusLg;
  final double compactHeight;
  final double touchHeight;
  final double typeBody;
  final double typeSmall;
  final double typeLabel;
  final double typeTitle;
  final int fastDurationMs;
  final int normalDurationMs;
}

class FleetSpliceThemeTokens {
  const FleetSpliceThemeTokens({required this.id, required this.colors});
  final String id;
  final FleetSpliceColors colors;
}

const fleetSpliceMetrics = FleetSpliceMetrics(
  space1: 4, space2: 8, space3: 12,
  space4: 16, space5: 24, space6: 32,
  radiusSm: 6, radiusMd: 8, radiusLg: 12,
  compactHeight: 32, touchHeight: 36,
  typeBody: 14, typeSmall: 12, typeLabel: 11, typeTitle: 18,
  fastDurationMs: 100, normalDurationMs: 160,
);

const fleetSpliceThemes = <FleetSpliceThemeTokens>[
  FleetSpliceThemeTokens(
    id: 'light',
    colors: FleetSpliceColors(
      canvas: Color(0xFFF4F6F8),
      surface: Color(0xFFFFFFFF),
      panel: Color(0xFFEEF2F5),
      raised: Color(0xFFFFFFFF),
      text: Color(0xFF1A2430),
      textMuted: Color(0xFF4A5C68),
      border: Color(0xFFC5D0D8),
      hover: Color(0xFFE5EEF2),
      accent: Color(0xFF1F5663),
      onAccent: Color(0xFFFFFFFF),
      accentHover: Color(0xFF2D6B79),
      selected: Color(0xFFDCE9ED),
      selectedText: Color(0xFF1F5663),
      focus: Color(0xFF2A7F90),
      online: Color(0xFF24735F),
      offline: Color(0xFF98631E),
      success: Color(0xFF1F7A5A),
      attention: Color(0xFF9A6418),
      warning: Color(0xFF9A6418),
      danger: Color(0xFF9B3B3B),
      streaming: Color(0xFF2A7F90),
      tool: Color(0xFF3B5F78),
      warningBg: Color(0xFFFFF4E8),
      warningText: Color(0xFF744515),
      warningBorder: Color(0xFFC79A5D),
      footer: Color(0xFFE8EEF1),
      shadowColor: Color(0x1418303C),
    ),
  ),
  FleetSpliceThemeTokens(
    id: 'dark',
    colors: FleetSpliceColors(
      canvas: Color(0xFF10171C),
      surface: Color(0xFF151E25),
      panel: Color(0xFF19232B),
      raised: Color(0xFF202E37),
      text: Color(0xFFEDF3F6),
      textMuted: Color(0xFFB3C4CE),
      border: Color(0xFF425966),
      hover: Color(0xFF2A3E48),
      accent: Color(0xFF92D5DF),
      onAccent: Color(0xFF082A33),
      accentHover: Color(0xFFB4E5EC),
      selected: Color(0xFF263D47),
      selectedText: Color(0xFFBCE8ED),
      focus: Color(0xFF9BE3EF),
      online: Color(0xFF76D4AF),
      offline: Color(0xFFEAC179),
      success: Color(0xFF76D4AF),
      attention: Color(0xFFEAC179),
      warning: Color(0xFFEAC179),
      danger: Color(0xFFEF9A9A),
      streaming: Color(0xFF9BE3EF),
      tool: Color(0xFF9BB8C8),
      warningBg: Color(0xFF3B2C18),
      warningText: Color(0xFFFFE0AC),
      warningBorder: Color(0xFFA18254),
      footer: Color(0xFF19232B),
      shadowColor: Color(0x44000000),
    ),
  ),
  FleetSpliceThemeTokens(
    id: 'oled-black',
    colors: FleetSpliceColors(
      canvas: Color(0xFF000000),
      surface: Color(0xFF000000),
      panel: Color(0xFF050607),
      raised: Color(0xFF101418),
      text: Color(0xFFF1F6F8),
      textMuted: Color(0xFFBAC8D0),
      border: Color(0xFF3D4D57),
      hover: Color(0xFF161D22),
      accent: Color(0xFFA2DDE6),
      onAccent: Color(0xFF082A33),
      accentHover: Color(0xFFCEF0F4),
      selected: Color(0xFF122028),
      selectedText: Color(0xFFC4EDF2),
      focus: Color(0xFFB1EEFA),
      online: Color(0xFF86DFB8),
      offline: Color(0xFFF0C881),
      success: Color(0xFF86DFB8),
      attention: Color(0xFFF0C881),
      warning: Color(0xFFF0C881),
      danger: Color(0xFFFF9B9B),
      streaming: Color(0xFFB1EEFA),
      tool: Color(0xFFA8C2CF),
      warningBg: Color(0xFF1A1408),
      warningText: Color(0xFFFFE4B5),
      warningBorder: Color(0xFFA98B5A),
      footer: Color(0xFF000000),
      shadowColor: Color(0x88000000),
    ),
  ),
  FleetSpliceThemeTokens(
    id: 'midnight',
    colors: FleetSpliceColors(
      canvas: Color(0xFF07111D),
      surface: Color(0xFF0B1624),
      panel: Color(0xFF0F1C2D),
      raised: Color(0xFF15243A),
      text: Color(0xFFE7F2FF),
      textMuted: Color(0xFF9BB0C8),
      border: Color(0xFF2A4060),
      hover: Color(0xFF17304A),
      accent: Color(0xFF4FD0E8),
      onAccent: Color(0xFF041018),
      accentHover: Color(0xFF7FDFF0),
      selected: Color(0xFF14324A),
      selectedText: Color(0xFFB9ECF7),
      focus: Color(0xFF5FD8EF),
      online: Color(0xFF4FD0A8),
      offline: Color(0xFFE0B45A),
      success: Color(0xFF4FD0A8),
      attention: Color(0xFFE0B45A),
      warning: Color(0xFFE0B45A),
      danger: Color(0xFFFF8F9A),
      streaming: Color(0xFF5FD8EF),
      tool: Color(0xFF89B4D4),
      warningBg: Color(0xFF2A2210),
      warningText: Color(0xFFFFE0AC),
      warningBorder: Color(0xFF8F7540),
      footer: Color(0xFF0A1522),
      shadowColor: Color(0x55000000),
    ),
  ),
  FleetSpliceThemeTokens(
    id: 'graphite',
    colors: FleetSpliceColors(
      canvas: Color(0xFF121417),
      surface: Color(0xFF171A1E),
      panel: Color(0xFF1C2025),
      raised: Color(0xFF262B31),
      text: Color(0xFFEEF0F2),
      textMuted: Color(0xFFA9B1BA),
      border: Color(0xFF3A424B),
      hover: Color(0xFF2A3037),
      accent: Color(0xFFC5CCD4),
      onAccent: Color(0xFF121417),
      accentHover: Color(0xFFDBE1E8),
      selected: Color(0xFF2C333B),
      selectedText: Color(0xFFE8EDF2),
      focus: Color(0xFFD0D7DF),
      online: Color(0xFF7DCAA8),
      offline: Color(0xFFD2B174),
      success: Color(0xFF7DCAA8),
      attention: Color(0xFFD2B174),
      warning: Color(0xFFD2B174),
      danger: Color(0xFFE59A9A),
      streaming: Color(0xFFD0D7DF),
      tool: Color(0xFFB5BEC8),
      warningBg: Color(0xFF2C2618),
      warningText: Color(0xFFF0DFB8),
      warningBorder: Color(0xFF8F7B4D),
      footer: Color(0xFF15181C),
      shadowColor: Color(0x50000000),
    ),
  ),
  FleetSpliceThemeTokens(
    id: 'warm',
    colors: FleetSpliceColors(
      canvas: Color(0xFFF3EEE6),
      surface: Color(0xFFFAF7F1),
      panel: Color(0xFFEFE7DB),
      raised: Color(0xFFFFFDF9),
      text: Color(0xFF2C241C),
      textMuted: Color(0xFF6F6254),
      border: Color(0xFFD5C7B4),
      hover: Color(0xFFE8DCCB),
      accent: Color(0xFF6A4F35),
      onAccent: Color(0xFFFFFAF2),
      accentHover: Color(0xFF826246),
      selected: Color(0xFFE5D7C4),
      selectedText: Color(0xFF4D3A27),
      focus: Color(0xFF8A6642),
      online: Color(0xFF3F7A5A),
      offline: Color(0xFF9A6B2A),
      success: Color(0xFF3F7A5A),
      attention: Color(0xFF9A6B2A),
      warning: Color(0xFF9A6B2A),
      danger: Color(0xFF9B4540),
      streaming: Color(0xFF8A6642),
      tool: Color(0xFF6D5A45),
      warningBg: Color(0xFFF6E5C8),
      warningText: Color(0xFF6D4A18),
      warningBorder: Color(0xFFC49A58),
      footer: Color(0xFFEBE3D7),
      shadowColor: Color(0x143A2A18),
    ),
  ),
];

/// Semantic icon intents (map to platform glyphs separately).
const fleetSpliceIconIntents = <String>['settings', 'sessions', 'context', 'send', 'interrupt', 'steer', 'review', 'connected', 'controller', 'viewer', 'toolRunning', 'toolCompleted', 'warning'];

/// Adaptive layout intents (thresholds are platform-local).
const fleetSpliceLayoutIntents = <String>['compact', 'medium', 'expanded'];

