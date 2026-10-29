package com.florachain.backend.migration;

import com.florachain.backend.repository.ProductRepository;
import com.florachain.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Guards the data layer:
 * <ul>
 *   <li>Flyway owns the schema (Hibernate must not create or alter tables).</li>
 *   <li>The migrated schema is validated against the JPA entity mapping.</li>
 *   <li>The reference data is seeded by the migration, not at runtime.</li>
 *   <li>Tests never touch a production datasource.</li>
 * </ul>
 */
@SpringBootTest(properties = {
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.datasource.url=jdbc:h2:mem:florachain_schema_validation_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE"
})
@ActiveProfiles("test")
class SchemaMigrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Should run every migration exactly once")
    void testAllMigrationsApplied() {
        Integer applied = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM \"flyway_schema_history\" WHERE \"success\" = TRUE", Integer.class);

        assertNotNull(applied);
        assertTrue(applied >= 3, "Expected the schema, alignment and seed migrations to be applied");
    }

    @Test
    @DisplayName("Should never run the test suite against a production datasource")
    void testDatasourceIsIsolated() throws Exception {
        String url = dataSource.getConnection().getMetaData().getURL();

        assertNotNull(url);
        assertTrue(url.startsWith("jdbc:h2:"), "Tests must use an isolated in-memory database, but used: " + url);
    }

    @Test
    @DisplayName("Should seed the reference data through the migration")
    void testReferenceDataIsSeeded() {
        assertEquals(5, productRepository.count());
        assertEquals(7, userRepository.count());
    }

    @Test
    @DisplayName("Should create the integrity constraints declared by the entities")
    void testIntegrityConstraintsExist() {
        assertNotNull(jdbcTemplate.queryForObject(
                "SELECT constraint_name FROM information_schema.table_constraints "
                        + "WHERE table_name = 'PRODUCTS' AND constraint_type = 'CHECK'", String.class));
        assertNotNull(jdbcTemplate.queryForObject(
                "SELECT index_name FROM information_schema.indexes "
                        + "WHERE table_name = 'PRODUCTS' AND index_name = 'IDX_PRODUCT_BATCH_ID'", String.class));
        assertNotNull(jdbcTemplate.queryForObject(
                "SELECT index_name FROM information_schema.indexes "
                        + "WHERE table_name = 'SHIPMENTS' AND index_name = 'IDX_SHIPMENT_TRACKING'", String.class));
    }
}
