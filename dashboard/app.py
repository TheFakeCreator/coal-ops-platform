import streamlit as st
import snowflake.connector
import pandas as pd

# 1. Page Configuration (Rich Aesthetics)
st.set_page_config(
    page_title="Coal Mine Production Dashboard",
    page_icon="⛏️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for a beautiful dark mode glassmorphism UI
st.markdown("""
<style>
    /* Main Background */
    .stApp {
        background-color: #0E1117;
        color: #FAFAFA;
        font-family: 'Inter', sans-serif;
    }
    
    /* Glassmorphism Metric Cards */
    div[data-testid="stMetric"] {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    div[data-testid="stMetric"]:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(255, 75, 75, 0.2);
    }
    
    /* Headers */
    h1, h2, h3 {
        color: #FF4B4B !important;
        font-weight: 600 !important;
    }
    
    /* Sidebar */
    [data-testid="stSidebar"] {
        background-color: rgba(30, 30, 40, 0.95) !important;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
</style>
""", unsafe_allow_html=True)

# 2. Connect to Snowflake
@st.cache_resource
def init_connection():
    return snowflake.connector.connect(
        **st.secrets["snowflake"]
    )

try:
    conn = init_connection()
except Exception as e:
    st.error(f"Could not connect to Snowflake. Did you update the secrets.toml? Error: {e}")
    st.stop()

# 3. Fetch Data
@st.cache_data(ttl=600)
def load_data():
    query = """
    SELECT * FROM COAL_MINE_DB.ANALYTICS.FCT_DAILY_PRODUCTION
    """
    return pd.read_sql(query, conn)

# 4. Build the UI
st.title("⛏️ Coal Mine Operations Dashboard")
st.markdown("Real-time production and hauling analytics straight from Snowflake.")

try:
    df = load_data()
    
    # Sidebar Filters
    st.sidebar.header("Filters")
    selected_region = st.sidebar.multiselect("Select Region", options=df["REGION"].unique(), default=df["REGION"].unique())
    selected_coal = st.sidebar.multiselect("Coal Type", options=df["PRIMARY_COAL_TYPE"].unique(), default=df["PRIMARY_COAL_TYPE"].unique())
    
    # Apply Filters
    filtered_df = df[(df["REGION"].isin(selected_region)) & (df["PRIMARY_COAL_TYPE"].isin(selected_coal))]
    
    # Top Row Metrics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Tons Extracted", f"{filtered_df['TONS_EXTRACTED'].sum():,.2f} T")
    with col2:
        st.metric("Active Mine Sites", filtered_df['SITE_NAME'].nunique())
    with col3:
        st.metric("Total Production Runs", len(filtered_df))
    
    st.markdown("---")
    
    # Charts
    col_chart1, col_chart2 = st.columns(2)
    
    with col_chart1:
        st.subheader("Production by Region")
        region_data = filtered_df.groupby("REGION")["TONS_EXTRACTED"].sum().reset_index()
        st.bar_chart(region_data.set_index("REGION"))
        
    with col_chart2:
        st.subheader("Raw Analytics Data")
        st.dataframe(filtered_df, use_container_width=True)

except Exception as e:
    st.warning("Data is still loading or there was an error running the query.")
    st.write(e)
