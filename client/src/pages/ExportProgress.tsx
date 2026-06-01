import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, BarChart3, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ExportProgress() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const { data: stats } = trpc.stats.get.useQuery();
  const { data: moodEntries } = trpc.mood.list.useQuery();
  const { data: journalEntries } = trpc.journal.list.useQuery();
  const { data: achievements } = trpc.streak.achievements.useQuery();

  const generatePDF = async () => {
    setIsExporting(true);
    try {
      // Crear contenido HTML para el PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${language === "fr" ? "Rapport de Progrès" : language === "en" ? "Progress Report" : "Reporte de Progreso"} - Sérénité</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #8b5cf6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              color: #8b5cf6;
              font-size: 32px;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #666;
              font-size: 14px;
            }
            .user-info {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .user-info p {
              margin: 5px 0;
              font-size: 14px;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 20px;
              font-weight: bold;
              color: #8b5cf6;
              border-left: 4px solid #8b5cf6;
              padding-left: 10px;
              margin-bottom: 15px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .stat-card {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #06b6d4;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .stat-value {
              font-size: 28px;
              font-weight: bold;
              color: #06b6d4;
              margin-top: 5px;
            }
            .achievement-list {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
            }
            .achievement-item {
              background: #fef3c7;
              padding: 10px;
              border-radius: 6px;
              text-align: center;
              font-size: 12px;
            }
            .achievement-icon {
              font-size: 24px;
              margin-bottom: 5px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              font-size: 12px;
            }
            th {
              background: #f3f4f6;
              padding: 10px;
              text-align: left;
              font-weight: bold;
              border-bottom: 2px solid #e5e7eb;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 ${language === "fr" ? "Rapport de Progrès" : language === "en" ? "Progress Report" : "Reporte de Progreso"}</h1>
            <p>Sérénité - Tu Aplicación de Salud Mental</p>
          </div>

          <div class="user-info">
            <p><strong>${language === "fr" ? "Utilisateur" : language === "en" ? "User" : "Usuario"}:</strong> ${user?.name || "Usuario"}</p>
            <p><strong>Email:</strong> ${user?.email || "N/A"}</p>
            <p><strong>${language === "fr" ? "Date du Rapport" : language === "en" ? "Report Date" : "Fecha de Reporte"}:</strong> ${new Date().toLocaleDateString(language === "fr" ? "fr-FR" : language === "en" ? "en-US" : "es-ES")}</p>
          </div>

          <div class="section">
            <div class="section-title">📈 ${language === "fr" ? "Statistiques Générales" : language === "en" ? "General Statistics" : "Estadísticas Generales"}</div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">${language === "fr" ? "Points Totaux" : language === "en" ? "Total Points" : "Puntos Totales"}</div>
                <div class="stat-value">${stats?.totalPoints || 0}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">${language === "fr" ? "Médailles Déverrouillées" : language === "en" ? "Unlocked Badges" : "Medallas Desbloqueadas"}</div>
                <div class="stat-value">${stats?.totalAchievements || 0}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">${language === "fr" ? "Défis Complétés" : language === "en" ? "Completed Challenges" : "Desafíos Completados"}</div>
                <div class="stat-value">${stats?.completedChallenges || 0}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">${language === "fr" ? "Entrées de Journal" : language === "en" ? "Journal Entries" : "Entradas de Diario"}</div>
                <div class="stat-value">${stats?.totalJournalEntries || 0}</div>
              </div>
            </div>
          </div>

          ${achievements && achievements.length > 0 ? `
          <div class="section">
            <div class="section-title">🏆 ${language === "fr" ? "Médailles Déverrouillées" : language === "en" ? "Unlocked Badges" : "Medallas Desbloqueadas"}</div>
            <div class="achievement-list">
              ${achievements.map((a: any) => `
                <div class="achievement-item">
                  <div class="achievement-icon">${a.icon}</div>
                  <div>${a.name}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          ${moodEntries && moodEntries.length > 0 ? `
          <div class="section">
            <div class="section-title">😊 ${language === "fr" ? "Dernières Entrées d'Humeur" : language === "en" ? "Latest Mood Entries" : "Últimas Entradas de Humor"}</div>
            <table>
              <thead>
                <tr>
                  <th>${language === "fr" ? "Date" : "Date"}</th>
                  <th>${language === "fr" ? "Humeur" : language === "en" ? "Mood" : "Humor"}</th>
                  <th>${language === "fr" ? "Énergie" : language === "en" ? "Energy" : "Energía"}</th>
                  <th>${language === "fr" ? "Stress" : language === "en" ? "Stress" : "Estrés"}</th>
                </tr>
              </thead>
              <tbody>
                ${moodEntries.slice(0, 10).map((entry) => `
                  <tr>
                    <td>${new Date(entry.createdAt).toLocaleDateString('es-ES')}</td>
                    <td>${['😢', '😕', '😐', '🙂', '😄'][entry.mood - 1]}</td>
                    <td>${entry.energyLevel || 'N/A'}/5</td>
                    <td>${entry.stressLevel || 'N/A'}/5</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="footer">
            <p>${language === "fr" ? "Ce rapport a été généré automatiquement par Sérénité" : language === "en" ? "This report was automatically generated by Sérénité" : "Este reporte fue generado automáticamente por Sérénité"}</p>
            <p>© 2026 Sérénité - Aplicación de Salud Mental</p>
          </div>
        </body>
        </html>
      `;

      // Crear blob y descargar
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a') as HTMLAnchorElement;
      link.href = url;
      link.download = `Reporte_Serenite_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      toast.error('Error al exportar el reporte');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl font-bold text-foreground">{t('export.title')}</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {t('export.description')}
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 border-2 border-purple-200 dark:border-purple-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Side - Info */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {t('export.personalized_report')}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t('export.download_html')}
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-cyan-500" />
                    <span className="text-foreground">{t('export.general_stats')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-foreground">{t('export.unlocked_medals')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-green-500" />
                    <span className="text-foreground">{t('export.mood_history')}</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  {t('export.report_format')}
                </p>
              </div>

              {/* Right Side - Action */}
              <div className="flex flex-col justify-center items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-6 shadow-lg">
                  <FileText className="w-16 h-16 text-white" />
                </div>
                <Button
                  size="lg"
                  onClick={generatePDF}
                  disabled={isExporting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      {t('export.generating')}
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      {t('export.download_button')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Preview */}
        <motion.div
          className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">
              {stats?.totalPoints || 0}
            </div>
            <p className="text-sm text-muted-foreground">{t('export.total_points')}</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {stats?.totalAchievements || 0}
            </div>
            <p className="text-sm text-muted-foreground">{t('export.medals')}</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-cyan-500 mb-2">
              {moodEntries?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">{t('export.mood_entries')}</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">
              {journalEntries?.length || 0}
            </div>
            <p className="text-sm text-muted-foreground">{t('export.journal_entries')}</p>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          className="mt-12 p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-semibold text-foreground mb-2">💡 {t('export.tips_title')}</h3>
          <ul className="text-muted-foreground space-y-2 text-sm">
            <li>• {t('export.tip_1')}</li>
            <li>• {t('export.tip_2')}</li>
            <li>• {t('export.tip_3')}</li>
            <li>• {t('export.tip_4')}</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
