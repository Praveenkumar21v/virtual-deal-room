"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../../../components/Sidebar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Triangle } from "react-loader-spinner";
import NotificationBell from "../../../components/NotificationBell";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface AnalyticsData {
  completed: number;
  pending: number;
  inProgress: number;
  cancelled: number;
  userEngagement: { _id: string; email: string; dealCount: number }[];
  dealsByMonth: { month: string; count: number }[];
  revenueByDeal: {
    _id: string;
    title: string;
    revenue: number;
    buyer: string;
    seller: string;
    createdAt: string;
    status: string;
  }[];}

export default function Analytics() {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<{
          success: boolean;
          data: AnalyticsData;
        }>(`/analytics`);
        setAnalytics(data.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        toast.error("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading || !analytics)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Triangle
          visible={true}
          height="80"
          width="80"
          color="#4fa94d"
          ariaLabel="triangle-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );

  const statusData = [
    { name: "Pending", value: analytics.pending },
    { name: "In Progress", value: analytics.inProgress },
    { name: "Completed", value: analytics.completed },
    { name: "Cancelled", value: analytics.cancelled },
  ];

  console.log(analytics.revenueByDeal);
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 p-6 animate-fade-in space-y-6">
        <div className="flex justify-end">
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <Button className="cursor-pointer" onClick={logout}>Logout</Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

        </div>

        <Tabs defaultValue="statistics">
          <TabsList>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="statistics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Deal Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {statusData.reduce((acc, curr) => acc + curr.value, 0) ===
                  0 ? (
                    <div className="text-center">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          labelLine={true}
                          label={({
                            name,
                            percent,
                            cx,
                            cy,
                            midAngle,
                            outerRadius,
                          }) => {
                            if (percent === 0) return null;

                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius * 1.3;
                            const x =
                              cx + radius * Math.cos(-midAngle * RADIAN);
                            const y =
                              cy + radius * Math.sin(-midAngle * RADIAN);

                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#666"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                fontSize={12}
                              >
                                {`${name}: ${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                        >
                          {statusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} deals`, "Count"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>User Engagement</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {analytics.userEngagement.length === 0 ? (
                    <div className="text-center">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.userEngagement}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="email" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value} deals`, "Count"]}
                        />
                        <Legend />
                        <Bar
                          dataKey="dealCount"
                          fill="#8884d8"
                          name="Deals Created"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Deals Over Time</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {analytics.dealsByMonth.length === 0 ? (
                    <div className="text-center">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.dealsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#8884d8"
                          name="Deals"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Top Revenue Deals</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {analytics.revenueByDeal.length === 0 ? (
                    <div className="text-center">No data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.revenueByDeal}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`$${value}`, "Revenue"]}
                        />
                        <Legend />
                        <Bar
                          dataKey="revenue"
                          fill="#8884d8"
                          name="Revenue ($)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Deal Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-secondary/50">
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.revenueByDeal.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      analytics.revenueByDeal.map((deal) => (
                        <TableRow
                          key={deal._id}
                          className="hover:bg-secondary/50 cursor-pointer"
                        >
                          <TableCell className="font-medium">
                            {deal.title}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                deal.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : deal.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : deal.status === "In Progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {deal.status}
                            </span>
                          </TableCell>
                          <TableCell>{deal.buyer}</TableCell>
                          <TableCell>{deal.seller}</TableCell>
                          <TableCell>${deal.revenue}</TableCell>
                          <TableCell>
                            {new Date(deal.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
